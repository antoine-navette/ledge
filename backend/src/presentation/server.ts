import type { createApp } from './app.js';
import type { Env } from '../infrastructure/config/env.js';

export const startServer = async (app: ReturnType<typeof createApp>, port: Env['port']): Promise<void> => {
    await app.listen({ port, host: '0.0.0.0' });
};
