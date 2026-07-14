import z from 'zod';

export const transactionNotFoundSchema = z
    .object({
        code: z.literal('TRANSACTION_NOT_FOUND'),
    })
    .meta({ id: 'TransactionNotFound' });

export type TransactionNotFoundSchema = z.output<typeof transactionNotFoundSchema>;
