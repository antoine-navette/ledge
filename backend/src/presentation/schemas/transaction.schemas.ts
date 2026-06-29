import z, { type ZodType } from 'zod';
import type { CreateTransactionSchema } from '@shared/schemas/transaction/create.schema.js';
import type { ReadTransactionSchema } from '@shared/schemas/transaction/read.schema.js';
import type { UpdateTransactionSchema } from '@shared/schemas/transaction/update.schema.js';
import type { DeleteTransactionSchema } from '@shared/schemas/transaction/delete.schema.js';
import type { ReadAllTransactionSchema } from '@shared/schemas/transaction/read-all.schema.js';

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

const nameSchema = z.string().trim().min(1, 'Name is required').max(99, 'Name is too long');

const valueSchema = z
    .number()
    .min(0.01, 'Value is too short')
    .refine((val) => {
        // We cannot return Number.isInteger(val * 100)
        // It doesn't work with some values (ex.: 542.42) due to binary conversions
        const str = val.toString();
        const decimals = str.split('.')[1];
        return !decimals || decimals.length <= 2;
    }, 'Value must have at most 2 decimal places')
    .max(999999999.99, 'Value is too big');

const expenseCategorySchema = z.enum(['need', 'want', 'investment']).nullable();

const transactionIdSchema = z.string().length(24, 'Invalid transaction ID');

export const createTransactionSchema: ZodType<CreateTransactionSchema> = z.object({
    body: z.discriminatedUnion('type', [
        z.object({
            month: monthSchema,
            name: nameSchema,
            value: valueSchema,
            type: z.literal('expense'),
            expenseCategory: expenseCategorySchema,
        }),
        z.object({
            month: monthSchema,
            name: nameSchema,
            value: valueSchema,
            type: z.literal('income'),
            expenseCategory: z.null(),
        }),
    ]),
    cookies: z.object({
        accessToken: z.string().optional(),
    }),
});

export const readAllTransactionsSchema: ZodType<ReadAllTransactionSchema> = z.object({
    cookies: z.object({
        accessToken: z.string().optional(),
    }),
});

export const readTransactionSchema: ZodType<ReadTransactionSchema> = z.object({
    params: z.object({
        transactionId: transactionIdSchema,
    }),
    cookies: z.object({
        accessToken: z.string().optional(),
    }),
});

export const updateTransactionSchema: ZodType<UpdateTransactionSchema> = z.object({
    body: z.discriminatedUnion('type', [
        z.object({
            name: nameSchema,
            value: valueSchema,
            type: z.literal('expense'),
            expenseCategory: expenseCategorySchema,
        }),
        z.object({
            name: nameSchema,
            value: valueSchema,
            type: z.literal('income'),
            expenseCategory: z.null(),
        }),
    ]),
    params: z.object({
        transactionId: transactionIdSchema,
    }),
    cookies: z.object({
        accessToken: z.string().optional(),
    }),
});

export const deleteTransactionSchema: ZodType<DeleteTransactionSchema> = z.object({
    params: z.object({
        transactionId: transactionIdSchema,
    }),
    cookies: z.object({
        accessToken: z.string().optional(),
    }),
});
