import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongoDb } }: { context: Context }) => {
    await mongoDb.collection('transactions').updateMany(
        { isIncome: true },
        {
            $set: { type: 'income' },
            $unset: { isIncome: '' },
        },
    );
    await mongoDb.collection('transactions').updateMany(
        { isIncome: false },
        {
            $set: { type: 'expense' },
            $unset: { isIncome: '' },
        },
    );
};
