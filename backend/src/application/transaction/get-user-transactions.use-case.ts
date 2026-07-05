import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';

export class GetUserTransactionsUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (userId: string) => {
        return await this.transactionRepository.findManyByUserId(userId);
    };
}
