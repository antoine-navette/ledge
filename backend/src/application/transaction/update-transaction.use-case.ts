import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import type { Transaction } from '../../domain/entities/transaction.js';
import { fail, ok, type Result } from '../../core/result.js';

type UpdateTransactionResult = Result<{ transaction: Transaction }, 'TRANSACTION_NOT_FOUND' | 'TRANSACTION_NOT_OWNED'>;

export class UpdateTransactionUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (
        transactionId: string,
        userId: string,
        name: string,
        value: number,
        type: 'expense' | 'income',
        expenseCategory: 'need' | 'want' | 'investment' | null,
    ): Promise<UpdateTransactionResult> => {
        const transaction = await this.transactionRepository.findById(transactionId);
        if (!transaction) return fail('TRANSACTION_NOT_FOUND');
        if (transaction.userId !== userId) return fail('TRANSACTION_NOT_OWNED');

        const updatedTransaction: Transaction = {
            id: transaction.id,
            userId: transaction.userId,
            month: transaction.month,
            name,
            value,
            type,
            expenseCategory,
            createdAt: transaction.createdAt,
            updatedAt: new Date(),
        };
        await this.transactionRepository.save(updatedTransaction);

        return ok({ transaction: updatedTransaction });
    };
}
