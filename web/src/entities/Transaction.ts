import type { CalendarDate } from './CalendarDate.ts';

export type Transaction = Readonly<{
    id: string;
    userId: string;
    name: string;
    value: number;
    type: 'income' | 'expense';
    category: 'need' | 'want' | 'investment' | null;
    date: CalendarDate;
    createdAt: Date;
    updatedAt: Date;
}>;
