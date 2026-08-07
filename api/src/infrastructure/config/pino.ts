import pino from 'pino';
import type { Env } from './env.js';

export const createPino = (nodeEnv: Env['nodeEnv']) => {
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

    // Writes to stdout for now. Swap target/options here once BetterStack is wired in.
    const transport = pino.transport({
        target: 'pino/file',
        options: { destination: 1 },
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
