import type { Transaction } from '../../../domain/entities/transaction.js';
import type { MongoTransactionDocument } from '../documents/mongo.transaction.document.js';
import { ObjectId } from 'mongodb';

export const MongoTransactionMapper = {
    toDocument: (transaction: Transaction): MongoTransactionDocument => ({
        _id: new ObjectId(transaction.id),
        userId: new ObjectId(transaction.userId),
        month: transaction.month,
        name: transaction.name,
        value: transaction.value,
        type: transaction.type,
        ...(transaction.category ? { category: transaction.category } : {}),
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
    }),

    toEntity: (document: MongoTransactionDocument): Transaction => ({
        id: document._id.toString(),
        userId: document.userId.toString(),
        month: document.month,
        name: document.name,
        value: document.value,
        type: document.type,
        ...(document.category ? { category: document.category } : {}),
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
    }),
};
