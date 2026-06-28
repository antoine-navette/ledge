import type { Express } from 'express';
import { Server } from 'node:http';
import type { Env } from '../infrastructure/config/env.js';

export const startServer = (app: Express, port: Env['port']): Promise<Server> => {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            resolve(server);
        });

        server.on('error', (err) => {
            reject(err);
        });
    });
};
