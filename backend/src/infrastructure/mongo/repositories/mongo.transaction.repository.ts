import { Collection, ObjectId } from 'mongodb';
import type { TransactionRepository } from '../../../domain/repositories/transaction.repository.js';
import type { Transaction } from '../../../domain/entities/transaction.js';
import type { MongoTransactionDocument } from '../documents/mongo.transaction.document.js';
import { MongoTransactionMapper } from '../mappers/mongo.transaction.mapper.js';

export class MongoTransactionRepository implements TransactionRepository {
    constructor(private transactionCollection: Collection<MongoTransactionDocument>) {}

    create = async (transaction: Transaction): Promise<void> => {
        const document = MongoTransactionMapper.toDocument(transaction);

        await this.transactionCollection.insertOne(document);
    };

    findById = async (id: string): Promise<Transaction | null> => {
        const document = await this.transactionCollection.findOne({ _id: new ObjectId(id) });

        return document ? MongoTransactionMapper.toEntity(document) : null;
    };

    findByUserId = async (userId: string): Promise<Transaction[]> => {
        const documents = await this.transactionCollection.find({ userId: new ObjectId(userId) }).toArray();

        return documents.map((document) => MongoTransactionMapper.toEntity(document));
    };

    save = async (transaction: Transaction): Promise<void> => {
        const { _id, ...rest } = MongoTransactionMapper.toDocument(transaction);

        await this.transactionCollection.updateOne(
            { _id },
            {
                $set: rest,
                $unset: {
                    ...(!('category' in rest) && { category: 1 }),
                },
            },
        );
    };

    delete = async (transaction: Transaction): Promise<void> => {
        const { _id } = MongoTransactionMapper.toDocument(transaction);

        await this.transactionCollection.deleteOne({ _id });
    };
}
