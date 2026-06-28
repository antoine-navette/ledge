import { loadEnv, type Env } from './infrastructure/config/env.js';
import { createPino } from './infrastructure/config/pino.js';
import { connectToRedis } from './infrastructure/config/redis.js';
import { connectToMongo } from './infrastructure/config/mongo.js';
import { JwtTokenManager } from './infrastructure/adapters/jwt.token-manager.js';
import { BcryptHasher } from './infrastructure/adapters/bcrypt.hasher.js';
import { NodemailerEmailSender } from './infrastructure/adapters/nodemailer.email-sender.js';
import { connectToSmtp } from './infrastructure/config/nodemailer.js';
import { RedisCacheStore } from './infrastructure/adapters/redis.cache-store.js';
import { MongoUserRepository } from './infrastructure/repositories/mongo.user.repository.js';
import { MongoTransactionRepository } from './infrastructure/repositories/mongo.transaction.repository.js';
import { MongoRefreshTokenRepository } from './infrastructure/repositories/mongo.refresh-token.repository.js';
import { createHttpApp } from './presentation/http/app.js';
import { buildContainer } from './presentation/container.js';
import { startServer } from './presentation/server.js';
import { MongoIdManager } from './infrastructure/adapters/mongo.id-manager.js';
import { CryptoTokenGenerator } from './infrastructure/adapters/crypto.token-generator.js';

const pino = createPino(process.env.NODE_ENV as Env['nodeEnv'], process.env.LOKI_URL as Env['lokiUrl']);

try {
    const { redisUrl, mongoUrl, smtpUrl, tokenSecret, emailFrom, webUrl, allowedOrigins, port } = loadEnv();
    pino.logger.info('Environment loaded');

    const mongo = await connectToMongo(mongoUrl);
    pino.logger.info('Mongo connected');

    const redis = await connectToRedis(redisUrl);
    pino.logger.info('Redis connected');

    const smtp = connectToSmtp(smtpUrl);
    pino.logger.info('SMTP connected');

    const idManager = new MongoIdManager();
    const tokenManager = new JwtTokenManager(tokenSecret);
    const tokenGenerator = new CryptoTokenGenerator();

    const container = buildContainer({
        tokenManager,
        hasher: new BcryptHasher(),
        emailSender: new NodemailerEmailSender(smtp.transporter),
        cacheStore: new RedisCacheStore(redis.client),
        idManager,
        tokenGenerator,
        userRepository: new MongoUserRepository(mongo.db.collection('users')),
        transactionRepository: new MongoTransactionRepository(mongo.db.collection('transactions')),
        refreshTokenRepository: new MongoRefreshTokenRepository(mongo.db.collection('refreshtokens')),
        emailFrom,
        webUrl,
    });

    const app = createHttpApp({
        logger: pino.logger,
        tokenManager,
        idManager,
        tokenGenerator,
        ...container,
        allowedOrigins,
    });

    const server = await startServer(app, port);
    pino.logger.info('Server started');

    const gracefulShutdown = async (signal: NodeJS.Signals) => {
        pino.logger.info(`Received ${signal}. Starting graceful shutdown...`);

        try {
            await new Promise<void>((resolve, reject) => {
                server.close((err?: Error) => (err ? reject(err) : resolve()));
            });
            pino.logger.info('HTTP server closed');

            smtp.transporter.close();
            pino.logger.info('SMTP disconnected');

            await redis.client.quit();
            pino.logger.info('Redis disconnected');

            await mongo.client.close();
            pino.logger.info('Mongo disconnected');

            pino.logger.info('Graceful shutdown completed successfully. Exiting.');

            await pino.flush();
            process.exit(0);
        } catch (err) {
            pino.logger.fatal({ err }, 'Error during graceful shutdown');

            await pino.flush();
            process.exit(1);
        }
    };
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
} catch (err) {
    pino.logger.fatal({ err }, err instanceof Error ? err.message : 'Unknown error');

    await pino.flush();
    process.exit(1);
}
