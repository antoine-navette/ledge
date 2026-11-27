import type { UserId } from './user.js';
import { CalendarDate } from '../value-objects/calendar-date.js';

export type TransactionId = string & { readonly __brand: 'TransactionId' };

export class Transaction {
    // Never set at runtime: only makes the class nominal, so a plain object can't be passed off as a Transaction without
    // going through its factories
    declare private readonly brand: 'Transaction';

    private constructor(
        public readonly id: TransactionId,
        public readonly userId: UserId,
        public readonly name: string,
        public readonly value: number,
        public readonly type: 'income' | 'expense',
        public readonly category: 'need' | 'want' | 'investment' | null,
        public readonly date: CalendarDate,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static create = (
        id: TransactionId,
        userId: UserId,
        name: string,
        value: number,
        type: 'income' | 'expense',
        category: 'need' | 'want' | 'investment' | null,
        date: CalendarDate,
        now: Date,
    ) => {
        const code = Transaction.validate(name, value, type, category, date, now);
        if (code) return [null, code] as const;

        return [new Transaction(id, userId, name, value, type, category, date, now, now), null] as const;
    };

    update = (
        name: string,
        value: number,
        type: 'income' | 'expense',
        category: 'need' | 'want' | 'investment' | null,
        date: CalendarDate,
        now: Date,
    ) => {
        const code = Transaction.validate(name, value, type, category, date, now);
        if (code) return [null, code] as const;

        return [
            new Transaction(this.id, this.userId, name, value, type, category, date, this.createdAt, now),
            null,
        ] as const;
    };

    private static validate = (
        name: string,
        value: number,
        type: 'income' | 'expense',
        category: 'need' | 'want' | 'investment' | null,
        date: CalendarDate,
        now: Date,
    ) => {
        // Strict on purpose: the name must already be trimmed, it is stored exactly as sent
        if (name !== name.trim() || name.length < 1 || name.length > 99) {
            return 'TRANSACTION_NAME_INVALID' as const;
        }

        // We cannot check Number.isInteger(value * 100)
        // It doesn't work with some values (ex.: 542.42) due to binary conversions
        const decimals = value.toString().split('.')[1];
        // Number.isFinite first: NaN fails every comparison below, so it would otherwise pass
        if (!Number.isFinite(value) || value < 0.01 || value > 999999999.99 || (decimals && decimals.length > 2)) {
            return 'TRANSACTION_VALUE_INVALID' as const;
        }

        // category only makes sense for an expense, and even then it stays optional
        if (type === 'income' && category !== null) {
            return 'TRANSACTION_CATEGORY_INVALID' as const;
        }

        // From 1970 to today, where today is taken as tomorrow in UTC: the user may already be on the next day (up to
        // UTC+14), so today in UTC would refuse a transaction made just after midnight in France. A future date may then
        // pass one day early, which is harmless
        const tomorrow = CalendarDate.fromUtc(new Date(now.getTime() + 24 * 60 * 60 * 1000));
        if (date.year < 1970 || date.isAfter(tomorrow)) {
            return 'TRANSACTION_DATE_INVALID' as const;
        }

        return null;
    };

    static reconstitute = (
        id: TransactionId,
        userId: UserId,
        name: string,
        value: number,
        type: 'income' | 'expense',
        category: 'need' | 'want' | 'investment' | null,
        date: CalendarDate,
        createdAt: Date,
        updatedAt: Date,
    ) => {
        return new Transaction(id, userId, name, value, type, category, date, createdAt, updatedAt);
    };
}
