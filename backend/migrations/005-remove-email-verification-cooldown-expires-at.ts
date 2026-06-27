import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongoDb } }: { context: Context }) => {
    await mongoDb
        .collection('users')
        .updateMany(
            { emailVerificationCooldownExpiresAt: { $exists: true } },
            { $unset: { emailVerificationCooldownExpiresAt: '' } },
        );
};
