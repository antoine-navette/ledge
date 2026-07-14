import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    await mongo.db.collection('users').updateMany({ updatedAt: null }, { $unset: { updatedAt: '' } });
    await mongo.db
        .collection('users')
        .updateMany(
            { emailVerificationCooldownExpiresAt: null },
            { $unset: { emailVerificationCooldownExpiresAt: '' } },
        );

    await mongo.db.collection('transactions').updateMany({ updatedAt: null }, { $unset: { updatedAt: '' } });

    await mongo.db.collection('refreshtokens').updateMany({ updatedAt: null }, { $unset: { updatedAt: '' } });
};
