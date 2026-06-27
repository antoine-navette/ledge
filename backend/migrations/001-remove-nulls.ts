import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongoDb } }: { context: Context }) => {
    await mongoDb.collection('users').updateMany({ updatedAt: null }, { $unset: { updatedAt: '' } });
    await mongoDb
        .collection('users')
        .updateMany(
            { emailVerificationCooldownExpiresAt: null },
            { $unset: { emailVerificationCooldownExpiresAt: '' } },
        );

    await mongoDb.collection('transactions').updateMany({ updatedAt: null }, { $unset: { updatedAt: '' } });

    await mongoDb.collection('refreshtokens').updateMany({ updatedAt: null }, { $unset: { updatedAt: '' } });
};
