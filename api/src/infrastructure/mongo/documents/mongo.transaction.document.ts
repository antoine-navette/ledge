import type { ObjectId } from 'mongodb';
import type { MongoCalendarDateDocument } from './mongo.calendar-date.document.js';

export type MongoTransactionDocument = {
    _id: ObjectId;
    userId: ObjectId;
    name: string;
    value: number;
    // A subdocument, replaced as a whole on each save: an income that was an expense loses its category with it
    kind: { type: 'income' } | { type: 'expense'; category: 'need' | 'want' | 'investment' | null };
    date: MongoCalendarDateDocument;
    createdAt: Date;
    updatedAt: Date;
};
