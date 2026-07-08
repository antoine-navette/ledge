import z from 'zod';

export const emailAlreadyVerifiedSchema = z.object({
    code: z.literal('EMAIL_ALREADY_VERIFIED'),
});

export type EmailAlreadyVerifiedSchema = z.output<typeof emailAlreadyVerifiedSchema>;
