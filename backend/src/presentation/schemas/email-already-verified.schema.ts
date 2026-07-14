import z from 'zod';

export const emailAlreadyVerifiedSchema = z
    .object({
        code: z.literal('EMAIL_ALREADY_VERIFIED'),
    })
    .meta({ id: 'EmailAlreadyVerified' });

export type EmailAlreadyVerifiedSchema = z.output<typeof emailAlreadyVerifiedSchema>;
