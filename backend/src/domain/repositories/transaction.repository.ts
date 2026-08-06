import type { Transaction } from '../entities/transaction.js';

export type TransactionCriteria = {
    userId?: Transaction['userId'];
    month?: Transaction['month'];
};

export interface TransactionRepository {
    create: (transaction: Transaction) => Promise<void>;
    find: (criteria: TransactionCriteria) => Promise<Transaction[]>;
    findById: (id: Transaction['id']) => Promise<Transaction | null>;
    save: (transaction: Transaction) => Promise<void>;
    delete: (transaction: Transaction) => Promise<void>;
}
