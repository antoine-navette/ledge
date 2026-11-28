import type { CalendarDate } from './CalendarDate.ts';

export type Transaction = Readonly<{
    id: string;
    userId: string;
    name: string;
    value: number;
    // Income or expense, with what only applies to each: an income has no category
    kind:
        | { readonly type: 'income' }
        // The category is optional only for the expenses entered before categories existed
        | { readonly type: 'expense'; readonly category: 'need' | 'want' | 'investment' | null };
    date: CalendarDate;
    createdAt: Date;
    updatedAt: Date;
}>;
