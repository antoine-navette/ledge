export type Transaction = Readonly<{
    id: string;
    userId: string;
    month: string;
    name: string;
    value: number;
    type: 'expense' | 'income';
    category?: 'need' | 'want' | 'investment';
    createdAt: Date;
    updatedAt: Date;
}>;
