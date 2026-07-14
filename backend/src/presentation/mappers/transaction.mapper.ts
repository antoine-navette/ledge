import type { Transaction } from '../../domain/entities/transaction.js';
import type { TransactionSchema } from '../schemas/transaction.schema.js';

export const TransactionMapper = {
    toSchema: (transaction: Transaction): TransactionSchema => ({
        id: transaction.id,
        userId: transaction.userId,
        month: transaction.month,
        name: transaction.name,
        value: transaction.value,
        type: transaction.type,
        expenseCategory: transaction.expenseCategory,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
    }),
};
