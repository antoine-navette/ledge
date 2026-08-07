import { MongoClient } from 'mongodb';
import type { Env } from './env.js';

export const connectToMongo = async (mongoUrl: Env['mongoUrl']) => {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db();

    return { client, db };
};
