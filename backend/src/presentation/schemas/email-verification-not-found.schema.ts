import z from 'zod';

export const emailVerificationNotFoundSchema = z
    .object({
        code: z.literal('EMAIL_VERIFICATION_NOT_FOUND'),
    })
    .meta({ id: 'EmailVerificationNotFound' });

export type EmailVerificationNotFoundSchema = z.output<typeof emailVerificationNotFoundSchema>;
