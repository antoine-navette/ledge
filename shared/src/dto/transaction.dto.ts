export type TransactionDto = Readonly<{
    id: string;
    userId: string;
    month: string;
    name: string;
    value: number;
    type: 'expense' | 'income';
    expenseCategory: 'need' | 'want' | 'investment' | null;
    createdAt: string;
    updatedAt: string;
}>;
