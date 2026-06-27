import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongoDb } }: { context: Context }) => {
    await mongoDb
        .collection('transactions')
        .updateMany({ isRecurring: { $exists: true } }, { $unset: { isRecurring: '' } });
};
