import type { Db } from 'mongodb';

// Every index the app relies on, for a new database. On an existing one, where earlier migrations already created them
// with these exact options, createIndex does nothing
export const up = async (db: Db) => {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    // sparse: users without a pending verification would otherwise all collide on a null token
    await db.collection('users').createIndex({ 'emailVerification.token': 1 }, { unique: true, sparse: true });

    await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    // Mongo removes each session once its expiresAt is reached
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    await db.collection('transactions').createIndex({ userId: 1, date: 1 });
};
