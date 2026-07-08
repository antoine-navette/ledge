import z from 'zod';

export const duplicateEmailSchema = z.object({
    code: z.literal('DUPLICATE_EMAIL'),
});

export type DuplicateEmailSchema = z.output<typeof duplicateEmailSchema>;