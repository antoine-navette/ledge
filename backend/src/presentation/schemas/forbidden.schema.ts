import z from 'zod';

export const forbiddenSchema = z.object({
    code: z.literal('FORBIDDEN'),
});

export type ForbiddenSchema = z.output<typeof forbiddenSchema>;