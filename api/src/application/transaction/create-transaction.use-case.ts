import type { UserId } from '../../domain/entities/user.js';
import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import { Transaction, type TransactionId } from '../../domain/entities/transaction.js';
import type { IdGenerator } from '../../domain/ports/id-generator.js';

export class CreateTransactionUseCase {
    constructor(
        private transactionRepository: TransactionRepository,
        private idGenerator: IdGenerator,
    ) {}

    execute = async (
        userId: UserId,
        name: string,
        value: number,
        type: 'income' | 'expense',
        category: 'need' | 'want' | 'investment' | null,
        date: Date,
    ) => {
        const now = new Date();

        const [transaction, code] = Transaction.create(
            this.idGenerator.generate() as TransactionId,
            userId,
            name,
            value,
            type,
            category,
            date,
            now,
        );
        if (code) return [null, code] as const;

        await this.transactionRepository.create(transaction);

        return [transaction, null] as const;
    };
}
