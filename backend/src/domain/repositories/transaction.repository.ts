import type { Transaction } from '../entities/transaction.js';

export interface TransactionRepository {
    create: (transaction: Transaction) => Promise<void>;
    findById: (id: string) => Promise<Transaction | null>;
    findByUserId: (userId: string) => Promise<Transaction[]>;
    save: (transaction: Transaction) => Promise<void>;
    delete: (transaction: Transaction) => Promise<void>;
}
