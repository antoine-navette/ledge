import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import type { Transaction } from '../../domain/entities/transaction.js';
import { fail, ok, type Result } from '../../core/result.js';

type DeleteTransactionResult = Result<{ transaction: Transaction }, 'TRANSACTION_NOT_FOUND' | 'TRANSACTION_NOT_OWNED'>;

export class DeleteTransactionUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (transactionId: string, userId: string): Promise<DeleteTransactionResult> => {
        const transaction = await this.transactionRepository.findById(transactionId);
        if (!transaction) return fail('TRANSACTION_NOT_FOUND');
        if (transaction.userId !== userId) return fail('TRANSACTION_NOT_OWNED');

        await this.transactionRepository.delete(transaction);

        return ok({ transaction });
    };
}
