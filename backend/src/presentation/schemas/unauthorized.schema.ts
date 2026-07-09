import z from 'zod';

export const unauthorizedSchema = z
    .object({
        code: z.literal('UNAUTHORIZED'),
    })
    .meta({ id: 'Unauthorized' });

export type UnauthorizedSchema = z.output<typeof unauthorizedSchema>;