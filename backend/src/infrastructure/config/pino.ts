import pino from 'pino';
import type { Env } from './env.js';

export const createPino = (nodeEnv: Env['nodeEnv'], lokiUrl: Env['lokiUrl']) => {
    if (nodeEnv === 'development') {
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
        target: 'pino-loki',
        options: {
            host: lokiUrl,
            labels: { service_name: 'backend' },
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
