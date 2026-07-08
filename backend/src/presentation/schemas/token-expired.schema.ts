import z from 'zod';

export const tokenExpiredSchema = z.object({
    code: z.literal('TOKEN_EXPIRED'),
});

export type TokenExpiredSchema = z.output<typeof tokenExpiredSchema>;