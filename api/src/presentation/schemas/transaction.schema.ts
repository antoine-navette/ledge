import z from 'zod';
import { calendarDateSchema } from './calendar-date.schema.js';
import { transactionKindSchema } from './transaction-kind.schema.js';

export const transactionSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        name: z.string(),
        value: z.number(),
        kind: transactionKindSchema,
        date: calendarDateSchema,
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
    })
    .meta({ id: 'Transaction' });

export type TransactionSchema = z.output<typeof transactionSchema>;
