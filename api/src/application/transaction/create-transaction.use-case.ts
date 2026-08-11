import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import type { Transaction } from '../../domain/entities/transaction.js';
import type { IdGenerator } from '../../domain/ports/id-generator.js';

export class CreateTransactionUseCase {
    constructor(
        private transactionRepository: TransactionRepository,
        private idGenerator: IdGenerator,
    ) {}

    execute = async (
        userId: string,
        name: string,
        value: number,
        type: 'income' | 'expense',
        category: 'need' | 'want' | 'investment' | undefined,
        date: Date,
    ) => {
        const now = new Date();

        const transaction: Transaction = {
            id: this.idGenerator.generate(),
            userId,
            name,
            value,
            type,
            ...(type === 'expense' && category ? { category } : {}),
            date,
            createdAt: now,
            updatedAt: now,
        };
        await this.transactionRepository.create(transaction);

        return transaction;
    };
}
