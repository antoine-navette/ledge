import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { MongoDBStorage, Umzug } from 'umzug';
import type { Db } from 'mongodb';
import { initPino } from '../../src/infrastructure/config/pino.js';
import { connectToMongo } from '../../src/infrastructure/config/mongo.js';
import { loadEnv } from '../../src/infrastructure/config/env.js';

export type Context = { mongo: { db: Db } };

// No logger yet: the logs config itself may be what's wrong. A config error is deterministic and also makes the
// migrations fail during deployment, so it doesn't need to reach Better Stack, unlike a startup failure below (e.g.
// Mongo unreachable)
const env = await Promise.try(loadEnv).catch((err: unknown) => {
    console.error('Failed to load the environment', err);
    process.exit(1);
});

const pino = initPino(env.logs);

// Wrapped in an async function (not awaited at the top level) so the pino transport's
// unref'd worker thread can't make Node think the module has nothing left to settle and
// force-exit with "Detected unsettled top-level await" (exit code 13) before flush() resolves.
const run = async () => {
    try {
        const mongo = await connectToMongo(env.mongoUrl);
        pino.logger.info('Mongo connected');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const umzug = new Umzug<Context>({
            migrations: {
                glob: [path.join(__dirname, '../../migrations', '*.{js,ts}'), { ignore: '**/*.d.ts' }],
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
        pino.logger.fatal({ err }, 'Failed to run migrations');

        await pino.flush();
        process.exit(1);
    }
};

void run();
