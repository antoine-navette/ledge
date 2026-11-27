import type { Transaction } from '../entities/transaction.js';

export interface TransactionRepository {
    create: (transaction: Transaction) => Promise<void>;
    findByUserIdAndYearAndMonth: (userId: Transaction['userId'], year: number, month: number) => Promise<Transaction[]>;
    findById: (id: Transaction['id']) => Promise<Transaction | null>;
    save: (transaction: Transaction) => Promise<void>;
    delete: (transaction: Transaction) => Promise<void>;
}
