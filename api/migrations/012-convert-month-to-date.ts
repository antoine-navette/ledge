import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    await mongo.db.collection('transactions').updateMany({}, [
        {
            $set: {
                date: { $dateFromString: { dateString: { $concat: ['$month', '-01T00:00:00.000Z'] } } },
            },
        },
        { $unset: 'month' },
    ]);

    await mongo.db.collection('transactions').dropIndex('userId_1');
    await mongo.db.collection('transactions').createIndex({ userId: 1, date: 1 });
};
