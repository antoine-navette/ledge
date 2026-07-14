import z from 'zod';

export const userSchema = z
    .object({
        id: z.string(),
        email: z.string(),
        isEmailVerified: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .meta({ id: 'User' });

export type UserSchema = z.output<typeof userSchema>;
