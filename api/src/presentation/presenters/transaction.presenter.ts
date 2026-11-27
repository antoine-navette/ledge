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
        date: { year: transaction.date.year, month: transaction.date.month, day: transaction.date.day },
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
    }),
};
