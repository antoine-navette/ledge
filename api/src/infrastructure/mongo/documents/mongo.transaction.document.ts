import type { ObjectId } from 'mongodb';

export type MongoTransactionDocument = {
    _id: ObjectId;
    userId: ObjectId;
    name: string;
    value: number;
    type: 'income' | 'expense';
    category: 'need' | 'want' | 'investment' | null;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
};
