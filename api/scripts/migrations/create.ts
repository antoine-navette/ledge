import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initPino } from '../../src/infrastructure/config/pino.js';
import { loadEnv } from '../../src/infrastructure/config/env.js';

// Run from the sources only, in development: the migration is written next to the others
const MIGRATIONS_DIR = fileURLToPath(new URL('../../migrations', import.meta.url));
// Kebab-case: lowercase letters and digits, single dashes between words
const NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const TEMPLATE = `import type { Db } from 'mongodb';

export const up = async (db: Db) => {};
`;

// No logger yet: the logs config itself may be what's wrong. Nothing else is read from the environment, but the logger
// needs it
const env = await Promise.try(loadEnv).catch((err: unknown) => {
    console.error('Failed to load the environment', err);
    process.exit(1);
});

const pino = initPino(env.logs);

// Wrapped in an async function (not awaited at the top level) so the pino transport's
// unref'd worker thread can't make Node think the module has nothing left to settle and
// force-exit with "Detected unsettled top-level await" (exit code 13) before flush() resolves.
const create = async () => {
    try {
        const name = process.argv[2];
        if (!name || !NAME_REGEX.test(name)) {
            pino.logger.fatal(
                { name },
                'Expected a kebab-case migration name, e.g. npm run migrations:create add-users-index',
            );

            await pino.flush();
            process.exit(1);
        }

        // UTC timestamp (YYYYMMDDHHmmss) first, so that sorting the files by name sorts them by creation date
        const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
        const path = join(MIGRATIONS_DIR, `${timestamp}_${name}.ts`);

        // wx: fails instead of overwriting an existing file
        await writeFile(path, TEMPLATE, { flag: 'wx' });
        pino.logger.info({ path }, 'Migration created');

        await pino.flush();
        process.exit(0);
    } catch (err) {
        pino.logger.fatal({ err }, 'Failed to create migration');

        await pino.flush();
        process.exit(1);
    }
};

void create();
