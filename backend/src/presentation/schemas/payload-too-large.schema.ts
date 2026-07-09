import z from 'zod';

export const payloadTooLargeSchema = z
    .object({
        code: z.literal('PAYLOAD_TOO_LARGE'),
    })
    .meta({ id: 'PayloadTooLarge' });

export type PayloadTooLargeSchema = z.output<typeof payloadTooLargeSchema>;