import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';
import type { Env } from './env.js';

type Input = {
    mongoUrl: Env['mongoUrl'];
};

type Output = {
    mongoClient: MongoClient;
    mongoDb: Db;
};

export const connectToMongo = async ({ mongoUrl }: Input): Promise<Output> => {
    const mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    const mongoDb = mongoClient.db();

    return { mongoClient, mongoDb };
};
