import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import type { Transaction } from '../../domain/entities/transaction.js';
import type { IdManager } from '../../domain/ports/id-manager.js';

type CreateTransactionInput = {
    userId: string;
    month: string;
    name: string;
    value: number;
    type: 'expense' | 'income';
    expenseCategory: 'need' | 'want' | 'investment' | null;
};

type CreateTransactionOutput = { transaction: Transaction };

export class CreateTransactionUseCase {
    constructor(
        private transactionRepository: TransactionRepository,
        private idManager: IdManager,
    ) {}

    execute = async (input: CreateTransactionInput): Promise<CreateTransactionOutput> => {
        const now = new Date();

        const transaction: Transaction = {
            id: this.idManager.generate(),
            ...input,
            createdAt: now,
            updatedAt: now,
        };
        await this.transactionRepository.create(transaction);

        return { transaction };
    };
}
