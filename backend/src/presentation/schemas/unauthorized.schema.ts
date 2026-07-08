import z from 'zod';

export const unauthorizedSchema = z.object({
    code: z.literal('UNAUTHORIZED'),
});

export type UnauthorizedSchema = z.output<typeof unauthorizedSchema>;