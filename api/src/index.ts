import { loadEnv } from './infrastructure/config/env.js';
import { initPino } from './infrastructure/config/pino.js';
import { connectToMongo } from './infrastructure/config/mongo.js';
import { connectToSmtp } from './infrastructure/config/nodemailer.js';
import { createApp } from './presentation/app.js';
import { startServer } from './presentation/server.js';
import { MongoUserRepository } from './infrastructure/mongo/repositories/mongo.user.repository.js';
import { MongoSessionRepository } from './infrastructure/mongo/repositories/mongo.session.repository.js';
import { NodemailerEmailSender } from './infrastructure/adapters/nodemailer.email-sender.js';
import { MongoIdGenerator } from './infrastructure/adapters/mongo.id-generator.js';
import { CryptoTokenGenerator } from './infrastructure/adapters/crypto.token-generator.js';
import { BcryptPasswordHasher } from './infrastructure/adapters/bcrypt.password-hasher.js';
import { AuthenticateUseCase } from './application/auth/authenticate.use-case.js';
import { LogoutUseCase } from './application/auth/logout.use-case.js';
import { LoginUseCase } from './application/auth/login.use-case.js';
import { RegisterUseCase } from './application/auth/register.use-case.js';
import { RequestEmailVerificationUseCase } from './application/email-verification/request-email-verification.use-case.js';
import { VerifyEmailUseCase } from './application/email-verification/verify-email.use-case.js';
import { MongoTransactionRepository } from './infrastructure/mongo/repositories/mongo.transaction.repository.js';
import { CreateTransactionUseCase } from './application/transaction/create-transaction.use-case.js';
import { GetUserTransactionsUseCase } from './application/transaction/get-user-transactions.use-case.js';
import { GetTransactionUseCase } from './application/transaction/get-transaction.use-case.js';
import { UpdateTransactionUseCase } from './application/transaction/update-transaction.use-case.js';
import { DeleteTransactionUseCase } from './application/transaction/delete-transaction.use-case.js';
import 'dotenv/config';

// No logger yet: the logs config itself may be what's wrong. A config error is deterministic and also makes the
// migrations fail during deployment, so it doesn't need to reach Better Stack, unlike a startup failure below (e.g.
// Mongo unreachable)
const env = await Promise.try(loadEnv).catch((err: unknown) => {
    console.error('Failed to load the environment', err);
    process.exit(1);
});

const pino = initPino(env.logs);

try {
    const mongo = await connectToMongo(env.mongoUrl);
    pino.logger.info('Mongo connected');

    const smtp = await connectToSmtp(env.smtpUrl);
    pino.logger.info('SMTP connected');

    const userRepository = new MongoUserRepository(mongo.db.collection('users'));
    const sessionRepository = new MongoSessionRepository(mongo.db.collection('sessions'));
    const transactionRepository = new MongoTransactionRepository(mongo.db.collection('transactions'));

    const emailSender = new NodemailerEmailSender(smtp.transporter);
    const idGenerator = new MongoIdGenerator();
    const tokenGenerator = new CryptoTokenGenerator();
    const passwordHasher = new BcryptPasswordHasher();

    const authenticateUseCase = new AuthenticateUseCase(sessionRepository, userRepository);
    const logoutUseCase = new LogoutUseCase(sessionRepository);
    const loginUseCase = new LoginUseCase(
        userRepository,
        sessionRepository,
        passwordHasher,
        idGenerator,
        tokenGenerator,
    );
    const registerUseCase = new RegisterUseCase(
        userRepository,
        sessionRepository,
        passwordHasher,
        idGenerator,
        tokenGenerator,
    );
    const requestEmailVerificationUseCase = new RequestEmailVerificationUseCase(
        userRepository,
        emailSender,
        tokenGenerator,
        env.emailFrom,
        env.webUrl,
    );
    const verifyEmailUseCase = new VerifyEmailUseCase(userRepository);
    const createTransactionUseCase = new CreateTransactionUseCase(transactionRepository, idGenerator);
    const getUserTransactionsUseCase = new GetUserTransactionsUseCase(transactionRepository);
    const getTransactionUseCase = new GetTransactionUseCase(transactionRepository);
    const updateTransactionUseCase = new UpdateTransactionUseCase(transactionRepository);
    const deleteTransactionUseCase = new DeleteTransactionUseCase(transactionRepository);

    const app = createApp(
        pino.logger,
        authenticateUseCase,
        logoutUseCase,
        loginUseCase,
        registerUseCase,
        requestEmailVerificationUseCase,
        verifyEmailUseCase,
        createTransactionUseCase,
        getUserTransactionsUseCase,
        getTransactionUseCase,
        updateTransactionUseCase,
        deleteTransactionUseCase,
    );

    await startServer(app);
    pino.logger.info('Server started');

    const gracefulShutdown = async (signal: NodeJS.Signals) => {
        pino.logger.info(`Received ${signal}. Starting graceful shutdown...`);

        try {
            await app.close();
            pino.logger.info('Server closed');

            smtp.transporter.close();
            pino.logger.info('SMTP disconnected');

            await mongo.client.close();
            pino.logger.info('Mongo disconnected');

            pino.logger.info('Graceful shutdown completed successfully. Exiting.');

            await pino.flush();
            process.exit(0);
        } catch (err) {
            pino.logger.fatal({ err }, 'Failed to shut down gracefully');

            await pino.flush();
            process.exit(1);
        }
    };
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
} catch (err) {
    pino.logger.fatal({ err }, 'Failed to start server');

    await pino.flush();
    process.exit(1);
}
