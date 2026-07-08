import z from 'zod';

export const transactionSchema = z.object({
    id: z.string(),
    userId: z.string(),
    month: z.string(),
    name: z.string(),
    value: z.number(),
    type: z.enum(['expense', 'income']),
    expenseCategory: z.enum(['need', 'want', 'investment']).nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type TransactionSchema = z.output<typeof transactionSchema>;