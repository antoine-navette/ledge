import type { UserId } from '../../domain/entities/user.js';
import type { TransactionId } from '../../domain/entities/transaction.js';
import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';

export class DeleteTransactionUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (id: TransactionId, userId: UserId) => {
        const transaction = await this.transactionRepository.findById(id);
        if (!transaction) return { success: false, code: 'TRANSACTION_NOT_FOUND' } as const;
        if (transaction.userId !== userId) return { success: false, code: 'TRANSACTION_NOT_OWNED' } as const;

        await this.transactionRepository.delete(transaction);

        return { success: true, data: transaction } as const;
    };
}
