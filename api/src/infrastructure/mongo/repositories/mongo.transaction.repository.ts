import { Collection, ObjectId } from 'mongodb';
import type {
    TransactionCriteria,
    TransactionRepository,
} from '../../../domain/repositories/transaction.repository.js';
import type { Transaction } from '../../../domain/entities/transaction.js';
import type { MongoTransactionDocument } from '../documents/mongo.transaction.document.js';
import { MongoTransactionMapper } from '../mappers/mongo.transaction.mapper.js';

export class MongoTransactionRepository implements TransactionRepository {
    constructor(private transactionCollection: Collection<MongoTransactionDocument>) {}

    create = async (transaction: Transaction): Promise<void> => {
        const document = MongoTransactionMapper.toDocument(transaction);

        await this.transactionCollection.insertOne(document);
    };

    find = async (criteria: TransactionCriteria): Promise<Transaction[]> => {
        if (criteria.userId !== undefined && !ObjectId.isValid(criteria.userId)) return [];

        const documents = await this.transactionCollection
            .find({
                ...(criteria.userId ? { userId: new ObjectId(criteria.userId) } : {}),
                // from/to are both inclusive: from is the first day, to is the last day.
                // Comparing to with $lte (rather than $lt on the next day) only works
                // because every stored date is exactly UTC midnight, guaranteed by
                // Transaction's own create()/update() validation. If a document ever ends
                // up with a non-midnight date, it wouldn't be caught here — but it means
                // invalid data already got written, which is the actual bug to fix, not
                // something this query should defend against.
                ...(criteria.from || criteria.to
                    ? {
                          date: {
                              ...(criteria.from ? { $gte: criteria.from } : {}),
                              ...(criteria.to ? { $lte: criteria.to } : {}),
                          },
                      }
                    : {}),
            })
            .toArray();

        return documents.map((document) => MongoTransactionMapper.toEntity(document));
    };

    findById = async (id: Transaction['id']): Promise<Transaction | null> => {
        if (!ObjectId.isValid(id)) return null;

        const document = await this.transactionCollection.findOne({ _id: new ObjectId(id) });

        return document ? MongoTransactionMapper.toEntity(document) : null;
    };

    save = async (transaction: Transaction): Promise<void> => {
        const { _id, ...rest } = MongoTransactionMapper.toDocument(transaction);

        await this.transactionCollection.updateOne({ _id }, { $set: rest });
    };

    delete = async (transaction: Transaction): Promise<void> => {
        const { _id } = MongoTransactionMapper.toDocument(transaction);

        await this.transactionCollection.deleteOne({ _id });
    };
}
