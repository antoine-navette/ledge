import z from 'zod';

export const emailVerificationCooldownActiveSchema = z
    .object({
        code: z.literal('EMAIL_VERIFICATION_COOLDOWN_ACTIVE'),
    })
    .meta({ id: 'EmailVerificationCooldownActive' });

export type EmailVerificationCooldownActiveSchema = z.output<typeof emailVerificationCooldownActiveSchema>;
