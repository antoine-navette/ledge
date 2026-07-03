import z from 'zod';

const schema = z
    .object({
        NODE_ENV: z.enum(['development', 'production']),
        ALLOWED_ORIGINS: z
            .string()
            .transform((value) => value.split(','))
            .pipe(z.array(z.url())),
        PORT: z.coerce.number(),
        MONGO_URL: z.url(),
        SMTP_URL: z.url(),
        EMAIL_FROM: z.string(),
        WEB_URL: z.url(),
        LOKI_URL: z.url(),
    })
    .transform(
        ({
            NODE_ENV,
            ALLOWED_ORIGINS,
            PORT,
            MONGO_URL,
            SMTP_URL,
            EMAIL_FROM,
            WEB_URL,
            LOKI_URL,
        }) => ({
            nodeEnv: NODE_ENV,
            allowedOrigins: ALLOWED_ORIGINS,
            port: PORT,
            mongoUrl: MONGO_URL,
            smtpUrl: SMTP_URL,
            emailFrom: EMAIL_FROM,
            webUrl: WEB_URL,
            lokiUrl: LOKI_URL,
        }),
    );

export type Env = z.output<typeof schema>;

export const loadEnv = (): Env => schema.parse(process.env);
