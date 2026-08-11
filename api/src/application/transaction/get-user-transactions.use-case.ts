import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';

export class GetUserTransactionsUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (userId: string, from?: Date, to?: Date) => {
        return await this.transactionRepository.find({
            userId,
            ...(from ? { from } : {}),
            ...(to ? { to } : {}),
        });
    };
}
