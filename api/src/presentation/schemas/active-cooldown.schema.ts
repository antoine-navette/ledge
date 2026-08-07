import z from 'zod';

export const activeCooldownSchema = z
    .object({
        code: z.literal('ACTIVE_COOLDOWN'),
    })
    .meta({ id: 'ActiveCooldown' });

export type ActiveCooldownSchema = z.output<typeof activeCooldownSchema>;
