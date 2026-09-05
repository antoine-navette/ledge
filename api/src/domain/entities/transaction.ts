export class Transaction {
    private constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly name: string,
        public readonly value: number,
        public readonly type: 'income' | 'expense',
        public readonly category: 'need' | 'want' | 'investment' | undefined,
        public readonly date: Date,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static create = (
        id: string,
        userId: string,
        name: string,
        value: number,
        type: 'income' | 'expense',
        category: 'need' | 'want' | 'investment' | undefined,
        date: Date,
    ) => {
        const now = new Date();

        if (!Transaction.isValid(name, value, type, category, date, now)) {
            return { success: false, code: 'TRANSACTION_INVALID' } as const;
        }

        return {
            success: true,
            data: new Transaction(id, userId, name, value, type, category, date, now, now),
        } as const;
    };

    update = (
        name: string,
        value: number,
        type: 'income' | 'expense',
        category: 'need' | 'want' | 'investment' | undefined,
        date: Date,
    ) => {
        const now = new Date();

        if (!Transaction.isValid(name, value, type, category, date, now)) {
            return { success: false, code: 'TRANSACTION_INVALID' } as const;
        }

        return {
            success: true,
            data: new Transaction(this.id, this.userId, name, value, type, category, date, this.createdAt, now),
        } as const;
    };

    private static isValid = (
        name: string,
        value: number,
        type: 'income' | 'expense',
        category: 'need' | 'want' | 'investment' | undefined,
        date: Date,
        now: Date,
    ): boolean => {
        const isNameValid = name.length >= 1 && name.length <= 99;

        // We cannot check Number.isInteger(value * 100)
        // It doesn't work with some values (ex.: 542.42) due to binary conversions
        const decimals = value.toString().split('.')[1];
        const isValueValid = value >= 0.01 && value <= 999999999.99 && (!decimals || decimals.length <= 2);

        // category only makes sense for an expense, and even then it stays optional
        const isCategoryValid = !(type === 'income' && category !== undefined);

        // date must be a valid, UTC-midnight day between the epoch and today
        const isDateValid =
            !Number.isNaN(date.getTime()) &&
            date.toISOString().endsWith('T00:00:00.000Z') &&
            date.getTime() >= 0 &&
            date.getTime() <= now.getTime();

        return isNameValid && isValueValid && isCategoryValid && isDateValid;
    };

    static reconstitute = (
        id: string,
        userId: string,
        name: string,
        value: number,
        type: 'income' | 'expense',
        category: 'need' | 'want' | 'investment' | undefined,
        date: Date,
        createdAt: Date,
        updatedAt: Date,
    ) => {
        return new Transaction(id, userId, name, value, type, category, date, createdAt, updatedAt);
    };
}
