import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';

export class DeleteTransactionUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (id: string, userId: string) => {
        const transaction = await this.transactionRepository.findById(id);
        if (!transaction) return { success: false, error: 'TRANSACTION_NOT_FOUND' } as const;
        if (transaction.userId !== userId) return { success: false, error: 'TRANSACTION_NOT_OWNED' } as const;

        await this.transactionRepository.delete(transaction);

        return { success: true, data: transaction } as const;
    };
}
