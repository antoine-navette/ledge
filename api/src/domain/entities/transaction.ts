export type Transaction = Readonly<{
    id: string;
    userId: string;
    month: string;
    name: string;
    value: number;
    type: 'income' | 'expense';
    category?: 'need' | 'want' | 'investment';
    createdAt: Date;
    updatedAt: Date;
}>;
