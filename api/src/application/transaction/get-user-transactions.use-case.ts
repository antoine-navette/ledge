import type { UserId } from '../../domain/entities/user.js';
import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';

export class GetUserTransactionsUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (userId: UserId, year: number, month: number) => {
        return await this.transactionRepository.findByUserIdAndYearAndMonth(userId, year, month);
    };
}
