import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongoDb } }: { context: Context }) => {
    await mongoDb
        .collection('users')
        .updateMany({ updatedAt: { $exists: false } }, [{ $set: { updatedAt: '$createdAt' } }]);

    await mongoDb
        .collection('transactions')
        .updateMany({ updatedAt: { $exists: false } }, [{ $set: { updatedAt: '$createdAt' } }]);

    await mongoDb
        .collection('refreshtokens')
        .updateMany({ updatedAt: { $exists: false } }, [{ $set: { updatedAt: '$createdAt' } }]);
};
