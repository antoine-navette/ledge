import type { User } from './user.js';
import { CalendarDate } from '../value-objects/calendar-date.js';

export class Transaction {
    // Never set at runtime: only makes the class nominal, so a plain object can't be passed off as a Transaction without
    // going through its factories
    declare private readonly brand: 'Transaction';

    private constructor(
        // Branded: an ID of another entity, or any string, can't be passed off as this one
        public readonly id: string & { readonly __brand: 'TransactionId' },
        public readonly userId: User['id'],
        public readonly name: string,
        public readonly value: number,
        // Income or expense, with what only applies to each: an income can't have a category, since there's no field
        // for it. Always set and replaced as a whole, so the type and the category can never disagree
        public readonly kind:
            | { readonly type: 'income' }
            // The category is optional only for the expenses entered before categories existed
            | { readonly type: 'expense'; readonly category: 'need' | 'want' | 'investment' | null },
        public readonly date: CalendarDate,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static create = (
        id: Transaction['id'],
        userId: User['id'],
        name: string,
        value: number,
        kind: Transaction['kind'],
        date: CalendarDate,
        now: Date,
    ) => {
        const code = Transaction.validate(name, value, date, now);
        if (code) return [null, code] as const;

        return [new Transaction(id, userId, name, value, kind, date, now, now), null] as const;
    };

    update = (name: string, value: number, kind: Transaction['kind'], date: CalendarDate, now: Date) => {
        const code = Transaction.validate(name, value, date, now);
        if (code) return [null, code] as const;

        return [new Transaction(this.id, this.userId, name, value, kind, date, this.createdAt, now), null] as const;
    };

    private static validate = (name: string, value: number, date: CalendarDate, now: Date) => {
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
        id: Transaction['id'],
        userId: User['id'],
        name: string,
        value: number,
        kind: Transaction['kind'],
        date: CalendarDate,
        createdAt: Date,
        updatedAt: Date,
    ) => {
        return new Transaction(id, userId, name, value, kind, date, createdAt, updatedAt);
    };
}
