import type { Transaction } from '../../domain/entities/transaction.js';
import type { TransactionSchema } from '../schemas/transaction.schema.js';

export const TransactionPresenter = {
    toSchema: (transaction: Transaction): TransactionSchema => ({
        id: transaction.id,
        userId: transaction.userId,
        name: transaction.name,
        value: transaction.value,
        type: transaction.type,
        category: transaction.category,
        // A calendar day: the API takes and returns it without the time
        date: transaction.date.toISOString().slice(0, 10),
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
    }),
};
