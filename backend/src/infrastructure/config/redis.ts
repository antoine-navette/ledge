import { createClient, type RedisClientType } from 'redis';
import type { Env } from './env.js';

export const connectToRedis = async (redisUrl: Env['redisUrl']) => {
    const client: RedisClientType = createClient({ url: redisUrl });

    await client.connect();

    return { client };
};
