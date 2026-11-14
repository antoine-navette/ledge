import pino, { type TransportTargetOptions } from 'pino';
import type { Env } from './env.js';

// Leaves room within Docker's 10 seconds between SIGTERM and SIGKILL to close the server and Mongo first
const FLUSH_TIMEOUT = 3000;

export const initPino = (logs: Env['logs']) => {
    const targets: TransportTargetOptions[] = [];
    if (logs.console) {
        // pino/file without a destination writes to stdout
        targets.push(
            logs.console.format === 'pretty'
                ? { target: 'pino-pretty', options: { colorize: true }, level: logs.level }
                : { target: 'pino/file', level: logs.level },
        );
    }
    if (logs.betterStack) {
        targets.push({
            target: '@logtail/pino',
            options: { sourceToken: logs.betterStack.token, options: { endpoint: logs.betterStack.url } },
            level: logs.level,
        });
    }

    // The level is needed on both sides: the logger drops what is below it, and each target defaults to info otherwise
    const transport = pino.transport({ targets });
    const logger = pino({ level: logs.level }, transport);
    const flush = () =>
        // Never rejects: the logs are best-effort, and a failure to write them must not change how the process exits.
        // Pino can't report its own failure, hence stderr directly
        new Promise<void>((resolve) => {
            // E.g. if the transport's thread hangs
            const timer = setTimeout(() => {
                console.error(`Timed out flushing the logs after ${FLUSH_TIMEOUT} ms`);
                resolve();
            }, FLUSH_TIMEOUT);
            transport.once('close', () => {
                clearTimeout(timer);
                resolve();
            });
            transport.once('error', (err: unknown) => {
                clearTimeout(timer);
                console.error('Failed to flush the logs', err);
                resolve();
            });
            transport.end();
        });

    return { logger, flush };
};
