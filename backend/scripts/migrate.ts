import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { MongoDBStorage, Umzug } from 'umzug';
import type { Db } from 'mongodb';
import { createPino } from '../src/infrastructure/config/pino.js';
import { connectToMongo } from '../src/infrastructure/config/mongo.js';
import { loadEnv, type Env } from '../src/infrastructure/config/env.js';

export type Context = { mongo: { db: Db } };

// .env is not verified yet, but we need a logger now
const pino = createPino(process.env.NODE_ENV as Env['nodeEnv'], process.env.LOKI_URL as Env['lokiUrl']);

try {
    const { mongoUrl } = loadEnv();
    pino.logger.info('Environment loaded');

    const mongo = await connectToMongo(mongoUrl);
    pino.logger.info('Mongo connected');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const umzug = new Umzug<Context>({
        migrations: {
            glob: [path.join(__dirname, '../migrations', '*.{js,ts}'), { ignore: '**/*.d.ts' }],
        },
        context: { mongo },
        storage: new MongoDBStorage({ connection: mongo.db }),
        logger: pino.logger,
    });
    await umzug.up();
    pino.logger.info('Migrations applied successfully');

    await mongo.client.close();
    pino.logger.info('Mongo disconnected');

    await pino.flush();
    process.exit(0);
} catch (err) {
    pino.logger.fatal({ err }, err instanceof Error ? err.message : 'Unknown error');

    await pino.flush();
    process.exit(1);
}
