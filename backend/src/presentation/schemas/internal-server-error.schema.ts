import z from 'zod';

export const internalServerErrorSchema = z.object({
    code: z.literal('INTERNAL_SERVER_ERROR'),
});

export type InternalServerErrorSchema = z.output<typeof internalServerErrorSchema>;