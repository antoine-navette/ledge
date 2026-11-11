import type { Context } from '../scripts/migrations/run.js';

export const up = async ({ context: { mongo } }: { context: Context }) => {
    await mongo.db.collection('refreshtokens').drop();
};
