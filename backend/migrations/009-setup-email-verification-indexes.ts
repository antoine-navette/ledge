import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    await mongo.db.collection('email_verifications').createIndex({ token: 1 }, { unique: true });
    await mongo.db.collection('email_verifications').createIndex({ userId: 1 }, { unique: true });
    await mongo.db.collection('email_verifications').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
};
