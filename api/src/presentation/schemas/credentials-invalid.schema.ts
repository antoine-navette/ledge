import z from 'zod';

export const credentialsInvalidSchema = z
    .object({
        code: z.literal('CREDENTIALS_INVALID'),
    })
    .meta({ id: 'CredentialsInvalid' });

export type CredentialsInvalidSchema = z.output<typeof credentialsInvalidSchema>;
