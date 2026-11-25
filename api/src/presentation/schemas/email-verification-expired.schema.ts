import z from 'zod';

export const emailVerificationExpiredSchema = z
    .object({
        code: z.literal('EMAIL_VERIFICATION_EXPIRED'),
    })
    .meta({ id: 'EmailVerificationExpired' });

export type EmailVerificationExpiredSchema = z.output<typeof emailVerificationExpiredSchema>;
