import z from 'zod';

export const userNotFoundSchema = z
    .object({
        code: z.literal('USER_NOT_FOUND'),
    })
    .meta({ id: 'UserNotFound' });

export type UserNotFoundSchema = z.output<typeof userNotFoundSchema>;