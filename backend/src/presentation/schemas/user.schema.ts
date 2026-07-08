import z from 'zod';

export const userSchema = z.object({
    id: z.string(),
    email: z.string(),
    isEmailVerified: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type UserSchema = z.output<typeof userSchema>;