import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    await mongo.db.collection('transactions').updateMany({ category: { $exists: false } }, { $set: { category: null } });
};
