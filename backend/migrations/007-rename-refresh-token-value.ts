import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    await mongo.db
        .collection('refreshtokens')
        .updateMany({ token: { $exists: true } }, { $rename: { token: 'value' } });
};
