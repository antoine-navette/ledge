import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    await mongo.db
        .collection('transactions')
        .updateMany({ expenseCategory: { $exists: true } }, { $rename: { expenseCategory: 'category' } });
};
