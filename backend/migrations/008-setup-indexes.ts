import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongoDb } }: { context: Context }) => {
    await mongoDb.collection('users').createIndex({ email: 1 }, { unique: true });

    await mongoDb.collection('refreshtokens').createIndex({ value: 1 }, { unique: true });
    await mongoDb.collection('refreshtokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    await mongoDb.collection('transactions').createIndex({ userId: 1 });
};
