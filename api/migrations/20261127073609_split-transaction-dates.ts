import type { Db } from 'mongodb';

// Transaction dates become calendar dates: { year, month, day } instead of a Date at midnight UTC. Only the dates still
// stored as Dates are converted, so running it again changes nothing
export const up = async (db: Db) => {
    await db.collection('transactions').updateMany({ date: { $type: 'date' } }, [
        {
            $set: {
                // Read in UTC, where every date was stored at midnight
                date: { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } },
            },
        },
    ]);

    if (await db.collection('transactions').indexExists('userId_1_date_1')) {
        await db.collection('transactions').dropIndex('userId_1_date_1');
    }
    await db.collection('transactions').createIndex({ userId: 1, 'date.year': 1, 'date.month': 1 });
};
