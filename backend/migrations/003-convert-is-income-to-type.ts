import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    await mongo.db.collection('transactions').updateMany(
        { isIncome: true },
        {
            $set: { type: 'income' },
            $unset: { isIncome: '' },
        },
    );
    await mongo.db.collection('transactions').updateMany(
        { isIncome: false },
        {
            $set: { type: 'expense' },
            $unset: { isIncome: '' },
        },
    );
};
