import z from 'zod';

export const unsupportedMediaTypeSchema = z
    .object({
        code: z.literal('UNSUPPORTED_MEDIA_TYPE'),
    })
    .meta({ id: 'UnsupportedMediaType' });

export type UnsupportedMediaTypeSchema = z.output<typeof unsupportedMediaTypeSchema>;
