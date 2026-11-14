import type { createApp } from './app.js';

// Internal port: Docker exposes the API to the web container only, so there is no reason to change it
const PORT = 3000;

export const startServer = async (app: ReturnType<typeof createApp>): Promise<void> => {
    await app.listen({ port: PORT, host: '0.0.0.0' });
};
