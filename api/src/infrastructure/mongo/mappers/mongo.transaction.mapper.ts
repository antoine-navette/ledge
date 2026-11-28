import type { User } from '../../../domain/entities/user.js';
import { Transaction } from '../../../domain/entities/transaction.js';
import type { MongoTransactionDocument } from '../documents/mongo.transaction.document.js';
import { ObjectId } from 'mongodb';
import { MongoCalendarDateMapper } from './mongo.calendar-date.mapper.js';

export const MongoTransactionMapper = {
    toInfrastructure: (transaction: Transaction): MongoTransactionDocument => ({
        _id: new ObjectId(transaction.id),
        userId: new ObjectId(transaction.userId),
        name: transaction.name,
        value: transaction.value,
        kind: transaction.kind,
        date: MongoCalendarDateMapper.toInfrastructure(transaction.date),
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
    }),

    toDomain: (document: MongoTransactionDocument): Transaction =>
        Transaction.reconstitute(
            document._id.toString() as Transaction['id'],
            document.userId.toString() as User['id'],
            document.name,
            document.value,
            document.kind,
            MongoCalendarDateMapper.toDomain(document.date),
            document.createdAt,
            document.updatedAt,
        ),
};
