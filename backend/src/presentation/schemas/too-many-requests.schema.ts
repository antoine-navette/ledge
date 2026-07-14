import z from 'zod';

export const tooManyRequestsSchema = z
    .object({
        code: z.literal('TOO_MANY_REQUESTS'),
    })
    .meta({ id: 'TooManyRequests' });

export type TooManyRequestsSchema = z.output<typeof tooManyRequestsSchema>;
