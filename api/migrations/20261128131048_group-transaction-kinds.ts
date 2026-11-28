import type { Db } from 'mongodb';

// The type and the category become one kind subdocument: { type: 'income' } or { type: 'expense', category }. An income
// keeps no category, an expense keeps its own (null if it never had one). Only the transactions still holding a type
// field are converted, so running it again changes nothing
export const up = async (db: Db) => {
    await db.collection('transactions').updateMany({ type: { $exists: true } }, [
        {
            $set: {
                kind: {
                    $cond: [
                        { $eq: ['$type', 'income'] },
                        { type: 'income' },
                        // $ifNull: a missing category would otherwise leave the field out instead of null
                        { type: 'expense', category: { $ifNull: ['$category', null] } },
                    ],
                },
            },
        },
        { $unset: ['type', 'category'] },
    ]);
};
