import type { Transaction } from '../entities/transaction.js';

export interface TransactionRepository {
    create: (transaction: Transaction) => Promise<void>;
    findById: (id: Transaction['id']) => Promise<Transaction | null>;
    findByUserId: (userId: Transaction['userId']) => Promise<Transaction[]>;
    save: (transaction: Transaction) => Promise<void>;
    delete: (transaction: Transaction) => Promise<void>;
}
