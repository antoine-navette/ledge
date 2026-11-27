import z from 'zod';
import { calendarDateSchema } from './calendar-date.schema.js';

export const transactionSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        name: z.string(),
        value: z.number(),
        type: z.enum(['income', 'expense']),
        category: z.enum(['need', 'want', 'investment']).nullable(),
        date: calendarDateSchema,
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
    })
    .meta({ id: 'Transaction' });

export type TransactionSchema = z.output<typeof transactionSchema>;
