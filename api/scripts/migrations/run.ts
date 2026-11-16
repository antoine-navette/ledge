import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { type Db, ObjectId } from 'mongodb';
import { initPino } from '../../src/infrastructure/config/pino.js';
import { connectToMongo } from '../../src/infrastructure/config/mongo.js';
import { loadEnv } from '../../src/infrastructure/config/env.js';

type MigrationDocument = {
    _id: ObjectId;
    // File name without its extension, e.g. 20261116182551_create-indexes
    name: string;
    createdAt: Date;
};

type Migration = {
    up: (db: Db) => Promise<void>;
};

// Next to this script, both as TypeScript sources (tsx, in development) and once built into dist (node, in production)
const MIGRATIONS_DIR = fileURLToPath(new URL('../../migrations', import.meta.url));
// .ts in development, .js once built, never the .d.ts the build also emits
const MIGRATION_FILE_REGEX = /^(.+?)(?<!\.d)\.(ts|js)$/;

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

        const migrationCollection = mongo.db.collection<MigrationDocument>('migrations');
        // Guarantees a migration can't be recorded twice
        await migrationCollection.createIndex({ name: 1 }, { unique: true });

        const appliedNames = new Set((await migrationCollection.find().toArray()).map((document) => document.name));

        // Names start with a UTC timestamp: sorted, they come in creation order. Every migration not applied yet runs,
        // even one older than the last applied (e.g. merged from another branch)
        const pending = (await readdir(MIGRATIONS_DIR))
            .map((file) => file.match(MIGRATION_FILE_REGEX))
            .filter((match) => match !== null)
            .map(([file, name]) => ({ file, name: name as string }))
            .filter(({ name }) => !appliedNames.has(name))
            .sort((a, b) => a.name.localeCompare(b.name));

        if (pending.length === 0) pino.logger.info('No pending migration');

        // One at a time and in order, stopping at the first failure: a failed migration isn't recorded, so it runs
        // again next time, from the start
        for (const { file, name } of pending) {
            pino.logger.info({ name }, 'Applying migration');

            const migration = (await import(pathToFileURL(join(MIGRATIONS_DIR, file)).href)) as Migration;
            await migration.up(mongo.db);
            await migrationCollection.insertOne({ _id: new ObjectId(), name, createdAt: new Date() });

            pino.logger.info({ name }, 'Migration applied');
        }

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
