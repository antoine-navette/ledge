import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { MongoDBStorage, Umzug } from 'umzug';
import type { Db } from 'mongodb';
import { createPinoInstance } from '../src/infrastructure/config/pino.js';
import { connectToMongo } from '../src/infrastructure/config/mongo.js';
import { PinoLogger } from '../src/infrastructure/adapters/pino.logger.js';
import { loadEnv } from '../src/infrastructure/config/env.js';

export type Context = { mongo: { db: Db } };

// .env is not verified yet, but we need a logger now
const logger = new PinoLogger(
    createPinoInstance({
        nodeEnv: process.env.NODE_ENV === 'development' ? 'development' : 'production',
        lokiUrl: process.env.LOKI_URL || 'http://loki:3100',
    }),
);

try {
    const { mongoUrl } = loadEnv();
    logger.info('Environment loaded');

    const mongo = await connectToMongo(mongoUrl);
    logger.info('Mongo connected');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const umzug = new Umzug<Context>({
        migrations: {
            glob: [path.join(__dirname, '../migrations', '*.{js,ts}'), { ignore: '**/*.d.ts' }],
        },
        context: { mongo },
        storage: new MongoDBStorage({ connection: mongo.db }),
        logger,
    });
    await umzug.up();
    logger.info('Migrations applied successfully');

    await mongo.client.close();
    logger.info('Mongo disconnected');

    await new Promise((r) => setTimeout(r, 250));
    process.exit(0);
} catch (err) {
    logger.fatal({ err }, err instanceof Error ? err.message : 'Unknown error');

    await new Promise((r) => setTimeout(r, 250));
    process.exit(1);
}
