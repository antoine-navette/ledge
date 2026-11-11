export type Transaction = Readonly<{
    id: string;
    userId: string;
    name: string;
    value: number;
    type: 'income' | 'expense';
    category: 'need' | 'want' | 'investment' | null;
    // A calendar day, at midnight UTC like in the API: read it with timeZone: 'UTC' or toISOString()
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}>;
