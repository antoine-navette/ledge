import z, { type ZodType } from 'zod';
import type { RequestEmailVerificationSchema } from '@shared/schemas/user/request-email-verification.schema.js';
import type { VerifyEmailSchema } from '@shared/schemas/user/verify-email.schema.js';
import type { MeSchema } from '@shared/schemas/user/me.schema.js';

export const requestEmailVerificationSchema: ZodType<RequestEmailVerificationSchema> = z.object({
    cookies: z.object({
        accessToken: z.string().optional(),
    }),
});

export const verifyEmailSchema: ZodType<VerifyEmailSchema> = z.object({
    body: z.object({
        emailVerificationToken: z.string(),
    }),
});

export const meSchema: ZodType<MeSchema> = z.object({
    cookies: z.object({
        accessToken: z.string().optional(),
    }),
});
