import z from 'zod';

export const badRequestSchema = z.object({
    code: z.literal('BAD_REQUEST'),
});

export type BadRequestSchema = z.output<typeof badRequestSchema>;