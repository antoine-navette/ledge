import { Collection, ObjectId } from 'mongodb';
import type { TransactionRepository } from '../../../domain/repositories/transaction.repository.js';
import type { Transaction } from '../../../domain/entities/transaction.js';
import type { MongoTransactionDocument } from '../documents/mongo.transaction.document.js';
import { MongoTransactionMapper } from '../mappers/mongo.transaction.mapper.js';

export class MongoTransactionRepository implements TransactionRepository {
    constructor(private transactionCollection: Collection<MongoTransactionDocument>) {}

    create = async (transaction: Transaction): Promise<void> => {
        const document = MongoTransactionMapper.toInfrastructure(transaction);

        await this.transactionCollection.insertOne(document);
    };

    findByUserIdAndYearAndMonth = async (
        userId: Transaction['userId'],
        year: number,
        month: number,
    ): Promise<Transaction[]> => {
        if (!ObjectId.isValid(userId)) return [];

        const documents = await this.transactionCollection
            .find({ userId: new ObjectId(userId), 'date.year': year, 'date.month': month })
            .toArray();

        return documents.map((document) => MongoTransactionMapper.toDomain(document));
    };

    findById = async (id: Transaction['id']): Promise<Transaction | null> => {
        if (!ObjectId.isValid(id)) return null;

        const document = await this.transactionCollection.findOne({ _id: new ObjectId(id) });

        return document ? MongoTransactionMapper.toDomain(document) : null;
    };

    save = async (transaction: Transaction): Promise<void> => {
        const { _id, ...rest } = MongoTransactionMapper.toInfrastructure(transaction);

        await this.transactionCollection.updateOne({ _id }, { $set: rest });
    };

    delete = async (transaction: Transaction): Promise<void> => {
        const { _id } = MongoTransactionMapper.toInfrastructure(transaction);

        await this.transactionCollection.deleteOne({ _id });
    };
}
