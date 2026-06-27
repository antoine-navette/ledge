import type { Context } from '../scripts/migrate.js';

export const up = async ({ context: { mongoDb } }: { context: Context }) => {
    await mongoDb.collection('refreshtokens').updateMany({ token: { $exists: true } }, { $rename: { token: 'value' } });
};
