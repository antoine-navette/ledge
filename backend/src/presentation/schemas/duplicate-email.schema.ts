import z from 'zod';

export const duplicateEmailSchema = z
    .object({
        code: z.literal('DUPLICATE_EMAIL'),
    })
    .meta({ id: 'DuplicateEmail' });

export type DuplicateEmailSchema = z.output<typeof duplicateEmailSchema>;
