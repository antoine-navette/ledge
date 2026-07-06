import { loadEnv, type Env } from './infrastructure/config/env.js';
import { createPino } from './infrastructure/config/pino.js';
import { connectToMongo } from './infrastructure/config/mongo.js';
import { BcryptPasswordHasher } from './infrastructure/adapters/bcrypt.password-hasher.js';
import { NodemailerEmailSender } from './infrastructure/adapters/nodemailer.email-sender.js';
import { connectToSmtp } from './infrastructure/config/nodemailer.js';
import { MongoUserRepository } from './infrastructure/repositories/mongo.user.repository.js';
import { MongoTransactionRepository } from './infrastructure/repositories/mongo.transaction.repository.js';
import { MongoSessionRepository } from './infrastructure/repositories/mongo.session.repository.js';
import { MongoEmailVerificationRepository } from './infrastructure/repositories/mongo.email-verification.repository.js';
import { createHttpApp } from './presentation/http/app.js';
import { buildContainer } from './presentation/container.js';
import { startServer } from './presentation/server.js';
import { MongoIdGenerator } from './infrastructure/adapters/mongo.id-generator.js';
import { CryptoTokenGenerator } from './infrastructure/adapters/crypto.token-generator.js';

const pino = createPino(process.env.NODE_ENV as Env['nodeEnv'], process.env.LOKI_URL as Env['lokiUrl']);

try {
    const { mongoUrl, smtpUrl, emailFrom, webUrl, allowedOrigins, port } = loadEnv();
    pino.logger.info('Environment loaded');

    const mongo = await connectToMongo(mongoUrl);
    pino.logger.info('Mongo connected');

    const smtp = connectToSmtp(smtpUrl);
    pino.logger.info('SMTP connected');

    const idGenerator = new MongoIdGenerator();
    const tokenGenerator = new CryptoTokenGenerator();

    const container = buildContainer({
        passwordHasher: new BcryptPasswordHasher(),
        emailSender: new NodemailerEmailSender(smtp.transporter),
        idGenerator,
        tokenGenerator,
        userRepository: new MongoUserRepository(mongo.db.collection('users')),
        transactionRepository: new MongoTransactionRepository(mongo.db.collection('transactions')),
        sessionRepository: new MongoSessionRepository(mongo.db.collection('sessions')),
        emailVerificationRepository: new MongoEmailVerificationRepository(mongo.db.collection('emailverifications')),
        emailFrom,
        webUrl,
    });

    const app = createHttpApp({
        logger: pino.logger,
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
