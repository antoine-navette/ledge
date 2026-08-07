import z from 'zod';

export const badRequestSchema = z
    .object({
        code: z.literal('BAD_REQUEST'),
    })
    .meta({ id: 'BadRequest' });

export type BadRequestSchema = z.output<typeof badRequestSchema>;
