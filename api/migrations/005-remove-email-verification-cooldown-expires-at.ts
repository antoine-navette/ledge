import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    await mongo.db
        .collection('users')
        .updateMany(
            { emailVerificationCooldownExpiresAt: { $exists: true } },
            { $unset: { emailVerificationCooldownExpiresAt: '' } },
        );
};
