import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    await mongo.db
        .collection('users')
        .updateMany({ updatedAt: { $exists: false } }, [{ $set: { updatedAt: '$createdAt' } }]);

    await mongo.db
        .collection('transactions')
        .updateMany({ updatedAt: { $exists: false } }, [{ $set: { updatedAt: '$createdAt' } }]);

    await mongo.db
        .collection('refreshtokens')
        .updateMany({ updatedAt: { $exists: false } }, [{ $set: { updatedAt: '$createdAt' } }]);
};
