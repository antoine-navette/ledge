import z from 'zod';

export const userSchema = z
    .object({
        id: z.string(),
        email: z.string(),
        isEmailVerified: z.boolean(),
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
    })
    .meta({ id: 'User' });

export type UserSchema = z.output<typeof userSchema>;
