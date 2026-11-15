import z from 'zod';

export const transactionSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        name: z.string(),
        value: z.number(),
        type: z.enum(['income', 'expense']),
        category: z.enum(['need', 'want', 'investment']).nullable(),
        date: z.iso.date(),
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
    })
    .meta({ id: 'Transaction' });

export type TransactionSchema = z.output<typeof transactionSchema>;
