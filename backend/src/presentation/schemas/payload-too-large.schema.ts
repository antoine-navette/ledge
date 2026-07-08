import z from 'zod';

export const payloadTooLargeSchema = z.object({
    code: z.literal('PAYLOAD_TOO_LARGE'),
});

export type PayloadTooLargeSchema = z.output<typeof payloadTooLargeSchema>;