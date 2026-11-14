import z from 'zod';

const schema = z.object({
    port: z.coerce.number(),
    mongoUrl: z.url(),
    smtpUrl: z.url(),
    emailFrom: z.string().min(1),
    webUrl: z.url(),
    logs: z
        .object({
            // Several at once: in production, logs go both to the console and to Better Stack
            targets: z.array(z.enum(['console', 'betterstack'])).min(1),
            level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']),
            // Each target's settings are only required when it's enabled, null otherwise: no dummy values to set in
            // development
            console: z.object({ format: z.enum(['json', 'pretty']) }).nullable(),
            betterStack: z.object({ url: z.url(), token: z.string().min(1) }).nullable(),
        })
        // targets is only needed to validate the input: once parsed, console and betterStack being null or not says the
        // same, and only they narrow the type, so targets is dropped rather than left as a second source of truth
        .transform(({ level, console, betterStack }) => ({ level, console, betterStack })),
});

export type Env = z.output<typeof schema>;

export const loadEnv = (): Env => {
    const logTargets = process.env['LOG_TARGETS']?.split(',') ?? [];

    return schema.parse({
        port: process.env['PORT'],
        mongoUrl: process.env['MONGO_URL'],
        smtpUrl: process.env['SMTP_URL'],
        emailFrom: process.env['EMAIL_FROM'],
        webUrl: process.env['WEB_URL'],
        logs: {
            targets: logTargets,
            level: process.env['LOG_LEVEL'],
            console: logTargets.includes('console') ? { format: process.env['CONSOLE_LOG_FORMAT'] } : null,
            betterStack: logTargets.includes('betterstack')
                ? { url: process.env['BETTERSTACK_LOGS_URL'], token: process.env['BETTERSTACK_LOGS_TOKEN'] }
                : null,
        },
    });
};
