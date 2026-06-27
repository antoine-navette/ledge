import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongoDb } }: { context: Context }) => {
    await mongoDb
        .collection('transactions')
        .updateMany({ type: 'expense', expenseCategory: { $exists: false } }, { $set: { expenseCategory: null } });
};
