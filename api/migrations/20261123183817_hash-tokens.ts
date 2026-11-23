import type { Db } from 'mongodb';

// Only the tokens' hashes are stored from now on. The existing sessions and pending email verifications hold the tokens
// themselves, so they are removed rather than converted: logging in again, or requesting a new verification email, is
// enough
export const up = async (db: Db) => {
    await db.collection('sessions').deleteMany({});
    if (await db.collection('sessions').indexExists('token_1')) await db.collection('sessions').dropIndex('token_1');
    await db.collection('sessions').createIndex({ tokenHash: 1 }, { unique: true });

    await db
        .collection('users')
        .updateMany({ emailVerification: { $ne: null } }, { $set: { emailVerification: null } });
    if (await db.collection('users').indexExists('emailVerification.token_1')) {
        await db.collection('users').dropIndex('emailVerification.token_1');
    }
    // sparse: users without a pending verification would otherwise all collide on a null hash
    await db.collection('users').createIndex({ 'emailVerification.tokenHash': 1 }, { unique: true, sparse: true });
};
