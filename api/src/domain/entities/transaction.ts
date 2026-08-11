export type Transaction = Readonly<{
    id: string;
    userId: string;
    name: string;
    value: number;
    type: 'income' | 'expense';
    category?: 'need' | 'want' | 'investment';
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}>;
