export type Transaction = Readonly<{
    id: string;
    userId: string;
    month: string;
    name: string;
    value: number;
    type: 'expense' | 'income';
    expenseCategory?: 'need' | 'want' | 'investment';
    createdAt: Date;
    updatedAt: Date;
}>;
