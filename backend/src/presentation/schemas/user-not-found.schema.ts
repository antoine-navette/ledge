import z from 'zod';

export const userNotFoundSchema = z.object({
    code: z.literal('USER_NOT_FOUND'),
});

export type UserNotFoundSchema = z.output<typeof userNotFoundSchema>;