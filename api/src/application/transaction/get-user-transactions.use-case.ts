import type { UserId } from '../../domain/entities/user.js';
import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';

export class GetUserTransactionsUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (userId: UserId, from: Date | undefined, to: Date | undefined) => {
        return await this.transactionRepository.find({
            userId,
            ...(from ? { from } : {}),
            ...(to ? { to } : {}),
        });
    };
}
