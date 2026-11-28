import type { User } from '../../domain/entities/user.js';
import { CalendarDate } from '../../domain/value-objects/calendar-date.js';
import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import { Transaction } from '../../domain/entities/transaction.js';
import type { IdGenerator } from '../../domain/ports/id-generator.js';

export class CreateTransactionUseCase {
    constructor(
        private transactionRepository: TransactionRepository,
        private idGenerator: IdGenerator,
    ) {}

    execute = async (
        userId: User['id'],
        name: string,
        value: number,
        kind: Transaction['kind'],
        date: { year: number; month: number; day: number },
    ) => {
        const now = new Date();

        const [calendarDate, dateCode] = CalendarDate.create(date.year, date.month, date.day);
        if (dateCode) return [null, dateCode] as const;

        const [transaction, code] = Transaction.create(
            this.idGenerator.generate() as Transaction['id'],
            userId,
            name,
            value,
            kind,
            calendarDate,
            now,
        );
        if (code) return [null, code] as const;

        await this.transactionRepository.create(transaction);

        return [transaction, null] as const;
    };
}
