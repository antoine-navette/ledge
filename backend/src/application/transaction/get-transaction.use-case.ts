import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import type { Transaction } from '../../domain/entities/transaction.js';
import { fail, ok, type Result } from '../../core/result.js';

type GetTransactionResult = Result<{ transaction: Transaction }, 'TRANSACTION_NOT_FOUND' | 'TRANSACTION_NOT_OWNED'>;

export class GetTransactionUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (transactionId: string, userId: string): Promise<GetTransactionResult> => {
        const transaction = await this.transactionRepository.findById(transactionId);
        if (!transaction) return fail('TRANSACTION_NOT_FOUND');
        if (transaction.userId !== userId) return fail('TRANSACTION_NOT_OWNED');

        return ok({ transaction });
    };
}
