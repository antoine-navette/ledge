import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    // Not migrating existing email_verifications documents onto their owning user: they're
    // short-lived (1h TTL) and losing a pending one just means the user has to ask for
    // another verification email — not worth the extra migration complexity.
    await mongo.db.collection('email_verifications').drop();

    await mongo.db.collection('users').updateMany({}, { $set: { emailVerification: null } });
    // sparse is required here: without it, every user with emailVerification: null (or the
    // field missing entirely) would collide on the unique index, since MongoDB indexes a
    // missing/null nested path as null regardless — sparse excludes those documents from the
    // index instead of indexing them as duplicate nulls.
    await mongo.db.collection('users').createIndex({ 'emailVerification.token': 1 }, { unique: true, sparse: true });
};
