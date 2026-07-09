import z from 'zod';

export const invalidCredentialsSchema = z
    .object({
        code: z.literal('INVALID_CREDENTIALS'),
    })
    .meta({ id: 'InvalidCredentials' });

export type InvalidCredentialsSchema = z.output<typeof invalidCredentialsSchema>;