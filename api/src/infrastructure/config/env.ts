import z from 'zod';

const schema = z
    .object({
        NODE_ENV: z.enum(['development', 'production']),
        PORT: z.coerce.number(),
        MONGO_URL: z.url(),
        SMTP_URL: z.url(),
        EMAIL_FROM: z.string(),
        WEB_URL: z.url(),
        BETTERSTACK_TOKEN: z.string(),
    })
    .transform(({ NODE_ENV, PORT, MONGO_URL, SMTP_URL, EMAIL_FROM, WEB_URL, BETTERSTACK_TOKEN }) => ({
        nodeEnv: NODE_ENV,
        port: PORT,
        mongoUrl: MONGO_URL,
        smtpUrl: SMTP_URL,
        emailFrom: EMAIL_FROM,
        webUrl: WEB_URL,
        betterStackToken: BETTERSTACK_TOKEN,
    }));

export type Env = z.output<typeof schema>;

export const loadEnv = (): Env => schema.parse(process.env);
