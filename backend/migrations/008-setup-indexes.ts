import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    await mongo.db.collection('users').createIndex({ email: 1 }, { unique: true });

    await mongo.db.collection('refreshtokens').createIndex({ value: 1 }, { unique: true });
    await mongo.db.collection('refreshtokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    await mongo.db.collection('transactions').createIndex({ userId: 1 });
};
