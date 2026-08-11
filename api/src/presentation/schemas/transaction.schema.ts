import z from 'zod';

export const transactionSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        name: z.string(),
        value: z.number(),
        type: z.enum(['income', 'expense']),
        category: z.enum(['need', 'want', 'investment']).optional(),
        date: z.date(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .meta({ id: 'Transaction' });

export type TransactionSchema = z.output<typeof transactionSchema>;
