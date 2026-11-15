import z from 'zod';

export const emailAlreadyInUseSchema = z
    .object({
        code: z.literal('EMAIL_ALREADY_IN_USE'),
    })
    .meta({ id: 'EmailAlreadyInUse' });

export type EmailAlreadyInUseSchema = z.output<typeof emailAlreadyInUseSchema>;
