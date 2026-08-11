import type { ObjectId } from 'mongodb';

export type MongoTransactionDocument = Readonly<{
    _id: ObjectId;
    userId: ObjectId;
    name: string;
    value: number;
    type: 'income' | 'expense';
    category?: 'need' | 'want' | 'investment';
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}>;
