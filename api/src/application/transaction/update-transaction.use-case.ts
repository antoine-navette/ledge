import type { User } from '../../domain/entities/user.js';
import type { Transaction } from '../../domain/entities/transaction.js';
import { CalendarDate } from '../../domain/value-objects/calendar-date.js';
import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';

export class UpdateTransactionUseCase {
    constructor(private transactionRepository: TransactionRepository) {}

    execute = async (
        id: Transaction['id'],
        userId: User['id'],
        name: string,
        value: number,
        kind: Transaction['kind'],
        date: { year: number; month: number; day: number },
    ) => {
        const now = new Date();

        const [calendarDate, dateCode] = CalendarDate.create(date.year, date.month, date.day);
        if (dateCode) return [null, dateCode] as const;

        const transaction = await this.transactionRepository.findById(id);
        if (!transaction) return [null, 'TRANSACTION_NOT_FOUND'] as const;
        if (transaction.userId !== userId) return [null, 'TRANSACTION_NOT_OWNED'] as const;

        const [updated, code] = transaction.update(name, value, kind, calendarDate, now);
        if (code) return [null, code] as const;

        await this.transactionRepository.save(updated);

        return [updated, null] as const;
    };
}
