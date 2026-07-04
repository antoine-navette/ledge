import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import type { Transaction } from '../../domain/entities/transaction.js';
import { fail, ok, type Result } from '../../core/result.js';

type UpdateTransactionResult = Result<{ transaction: Transaction }, 'TRANSACTION_NOT_FOUND' | 'TRANSACTION_NOT_OWNED'>;

export class UpdateTransactionUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (
        id: string,
        userId: string,
        name: string,
        value: number,
        type: 'expense' | 'income',
        expenseCategory: 'need' | 'want' | 'investment' | null,
    ): Promise<UpdateTransactionResult> => {
        const transaction = await this.transactionRepository.findById(id);
        if (!transaction) return fail('TRANSACTION_NOT_FOUND');
        if (transaction.userId !== userId) return fail('TRANSACTION_NOT_OWNED');

        const updated: Transaction = { ...transaction, name, value, type, expenseCategory, updatedAt: new Date() };
        await this.transactionRepository.save(updated);

        return ok({ transaction: updated });
    };
}
