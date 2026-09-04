import z from 'zod';

const base = z.object({
    NODE_ENV: z.enum(['development', 'production']),
    PORT: z.coerce.number(),
    MONGO_URL: z.url(),
    SMTP_URL: z.url(),
    EMAIL_FROM: z.string(),
    WEB_URL: z.url(),
});

const schema = z
    .discriminatedUnion('PINO_TARGET', [
        base.extend({ PINO_TARGET: z.literal('pino-pretty') }),
        base.extend({
            PINO_TARGET: z.literal('@logtail/pino'),
            BETTERSTACK_URL: z.url(),
            BETTERSTACK_TOKEN: z.string(),
        }),
    ])
    .transform((data) => {
        const common = {
            nodeEnv: data.NODE_ENV,
            port: data.PORT,
            mongoUrl: data.MONGO_URL,
            smtpUrl: data.SMTP_URL,
            emailFrom: data.EMAIL_FROM,
            webUrl: data.WEB_URL,
        };

        if (data.PINO_TARGET === 'pino-pretty') {
            return { ...common, pinoTarget: data.PINO_TARGET };
        }

        return {
            ...common,
            pinoTarget: data.PINO_TARGET,
            betterStackUrl: data.BETTERSTACK_URL,
            betterStackToken: data.BETTERSTACK_TOKEN,
        };
    });

export type Env = z.output<typeof schema>;

export const loadEnv = (): Env => schema.parse(process.env);
