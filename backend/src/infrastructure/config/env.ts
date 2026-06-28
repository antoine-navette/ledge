import z from 'zod';

const schema = z
    .object({
        NODE_ENV: z.enum(['development', 'production']),
        TOKEN_SECRET: z.string(),
        ALLOWED_ORIGINS: z
            .string()
            .transform((value) => value.split(','))
            .pipe(z.array(z.url())),
        PORT: z.coerce.number(),
        MONGO_URL: z.url(),
        REDIS_URL: z.url(),
        SMTP_URL: z.url(),
        EMAIL_FROM: z.string(),
        LOKI_URL: z.url(),
    })
    .transform(
        ({ NODE_ENV, TOKEN_SECRET, ALLOWED_ORIGINS, PORT, MONGO_URL, REDIS_URL, SMTP_URL, EMAIL_FROM, LOKI_URL }) => ({
            nodeEnv: NODE_ENV,
            tokenSecret: TOKEN_SECRET,
            allowedOrigins: ALLOWED_ORIGINS,
            port: PORT,
            mongoUrl: MONGO_URL,
            redisUrl: REDIS_URL,
            smtpUrl: SMTP_URL,
            emailFrom: EMAIL_FROM,
            lokiUrl: LOKI_URL,
        }),
    );

export type Env = z.output<typeof schema>;

export const loadEnv = (): Env => schema.parse(process.env);
