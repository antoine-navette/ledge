import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import type { Transaction } from '../../domain/entities/transaction.js';

export class UpdateTransactionUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (
        id: string,
        userId: string,
        name: string,
        value: number,
        type: 'expense' | 'income',
        category?: 'need' | 'want' | 'investment',
    ) => {
        const transaction = await this.transactionRepository.findById(id);
        if (!transaction) return { success: false, error: 'TRANSACTION_NOT_FOUND' } as const;
        if (transaction.userId !== userId) return { success: false, error: 'TRANSACTION_NOT_OWNED' } as const;

        const updated: Transaction = {
            id: transaction.id,
            userId: transaction.userId,
            month: transaction.month,
            name,
            value,
            type,
            ...(type === 'expense' && category ? { category } : {}),
            createdAt: transaction.createdAt,
            updatedAt: new Date(),
        };
        await this.transactionRepository.save(updated);

        return { success: true, data: updated } as const;
    };
}
