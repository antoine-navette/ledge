import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    await mongo.db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await mongo.db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
};
