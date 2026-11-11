import type { UserId } from '../../domain/entities/user.js';
import type { TransactionId } from '../../domain/entities/transaction.js';
import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';

export class UpdateTransactionUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (
        id: TransactionId,
        userId: UserId,
        name: string,
        value: number,
        type: 'income' | 'expense',
        category: 'need' | 'want' | 'investment' | null,
        date: Date,
    ) => {
        const now = new Date();

        const transaction = await this.transactionRepository.findById(id);
        if (!transaction) return [null, 'TRANSACTION_NOT_FOUND'] as const;
        if (transaction.userId !== userId) return [null, 'TRANSACTION_NOT_OWNED'] as const;

        const [updated, code] = transaction.update(name, value, type, category, date, now);
        if (code) return [null, code] as const;

        await this.transactionRepository.save(updated);

        return [updated, null] as const;
    };
}
