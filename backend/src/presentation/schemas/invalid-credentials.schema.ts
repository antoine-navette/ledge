import z from 'zod';

export const invalidCredentialsSchema = z.object({
    code: z.literal('INVALID_CREDENTIALS'),
});

export type InvalidCredentialsSchema = z.output<typeof invalidCredentialsSchema>;