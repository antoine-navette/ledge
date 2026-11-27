import type { ObjectId } from 'mongodb';
import type { MongoCalendarDateDocument } from './mongo.calendar-date.document.js';

export type MongoTransactionDocument = {
    _id: ObjectId;
    userId: ObjectId;
    name: string;
    value: number;
    type: 'income' | 'expense';
    category: 'need' | 'want' | 'investment' | null;
    date: MongoCalendarDateDocument;
    createdAt: Date;
    updatedAt: Date;
};
