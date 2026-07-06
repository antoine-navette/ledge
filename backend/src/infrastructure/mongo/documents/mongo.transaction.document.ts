import type { ObjectId } from 'mongodb';

export type MongoTransactionDocument = Readonly<{
    _id: ObjectId;
    userId: ObjectId;
    month: string;
    name: string;
    value: number;
    type: 'expense' | 'income';
    expenseCategory?: 'need' | 'want' | 'investment';
    createdAt: Date;
    updatedAt: Date;
}>;
