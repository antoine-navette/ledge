import pino from 'pino';
import type { Env } from './env.js';

export const createPino = (env: Env) => {
    if (env.pinoTarget === 'pino-pretty') {
        const transport = pino.transport({
            target: 'pino-pretty',
            options: { colorize: true },
        });
        const logger = pino({ level: 'debug' }, transport);
        const flush = () =>
            new Promise<void>((resolve, reject) => {
                transport.once('close', resolve);
                transport.once('error', reject);
                transport.end();
            });
        return { logger, flush };
    }

    const transport = pino.transport({
        target: '@logtail/pino',
        options: {
            sourceToken: env.betterStackToken,
            options: { endpoint: env.betterStackUrl },
        },
    });
    const logger = pino({ level: 'info' }, transport);
    const flush = () =>
        new Promise<void>((resolve, reject) => {
            transport.once('close', resolve);
            transport.once('error', reject);
            transport.end();
        });
    return { logger, flush };
};
