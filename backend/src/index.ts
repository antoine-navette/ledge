import { loadEnv, type Env } from './infrastructure/config/env.js';
import { createPino } from './infrastructure/config/pino.js';
import { connectToMongo } from './infrastructure/config/mongo.js';
import { connectToSmtp } from './infrastructure/config/nodemailer.js';
import { createApp } from './presentation/app.js';
import { startServer } from './presentation/server.js';
import { MongoUserRepository } from './infrastructure/mongo/repositories/mongo.user.repository.js';
import { MongoSessionRepository } from './infrastructure/mongo/repositories/mongo.session.repository.js';
import { MongoEmailVerificationRepository } from './infrastructure/mongo/repositories/mongo.email-verification.repository.js';
import { NodemailerEmailSender } from './infrastructure/adapters/nodemailer.email-sender.js';
import { MongoIdGenerator } from './infrastructure/adapters/mongo.id-generator.js';
import { CryptoTokenGenerator } from './infrastructure/adapters/crypto.token-generator.js';
import { BcryptPasswordHasher } from './infrastructure/adapters/bcrypt.password-hasher.js';
import { AuthenticateUseCase } from './application/auth/authenticate.use-case.js';
import { LogoutUseCase } from './application/auth/logout.use-case.js';
import { LoginUseCase } from './application/auth/login.use-case.js';
import { RegisterUseCase } from './application/auth/register.use-case.js';
import { GetCurrentUserUseCase } from './application/user/get-current-user.use-case.js';
import { RequestEmailVerificationUseCase } from './application/email-verification/request-email-verification.use-case.js';
import { VerifyEmailUseCase } from './application/email-verification/verify-email.use-case.js';
import { MongoTransactionRepository } from './infrastructure/mongo/repositories/mongo.transaction.repository.js';
import { CreateTransactionUseCase } from './application/transaction/create-transaction.use-case.js';
import { GetUserTransactionsUseCase } from './application/transaction/get-user-transactions.use-case.js';
import { GetTransactionUseCase } from './application/transaction/get-transaction.use-case.js';
import { UpdateTransactionUseCase } from './application/transaction/update-transaction.use-case.js';
import { DeleteTransactionUseCase } from './application/transaction/delete-transaction.use-case.js';

const pino = createPino(process.env.NODE_ENV as Env['nodeEnv'], process.env.LOKI_URL as Env['lokiUrl']);

try {
    const { mongoUrl, smtpUrl, allowedOrigins, port, emailFrom, webUrl } = loadEnv();
    pino.logger.info('Environment loaded');

    const mongo = await connectToMongo(mongoUrl);
    pino.logger.info('Mongo connected');

    const smtp = connectToSmtp(smtpUrl);
    pino.logger.info('SMTP connected');

    const userRepository = new MongoUserRepository(mongo.db.collection('users'));
    const sessionRepository = new MongoSessionRepository(mongo.db.collection('sessions'));
    const emailVerificationRepository = new MongoEmailVerificationRepository(
        mongo.db.collection('email_verifications'),
    );
    const transactionRepository = new MongoTransactionRepository(mongo.db.collection('transactions'));

    const emailSender = new NodemailerEmailSender(smtp.transporter);
    const idGenerator = new MongoIdGenerator();
    const tokenGenerator = new CryptoTokenGenerator();
    const passwordHasher = new BcryptPasswordHasher();

    const authenticateUseCase = new AuthenticateUseCase(sessionRepository);
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
    const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
    const requestEmailVerificationUseCase = new RequestEmailVerificationUseCase(
        userRepository,
        emailVerificationRepository,
        emailSender,
        idGenerator,
        tokenGenerator,
        emailFrom,
        webUrl,
    );
    const verifyEmailUseCase = new VerifyEmailUseCase(userRepository, emailVerificationRepository);
    const createTransactionUseCase = new CreateTransactionUseCase(transactionRepository, idGenerator);
    const getUserTransactionsUseCase = new GetUserTransactionsUseCase(transactionRepository);
    const getTransactionUseCase = new GetTransactionUseCase(transactionRepository);
    const updateTransactionUseCase = new UpdateTransactionUseCase(transactionRepository);
    const deleteTransactionUseCase = new DeleteTransactionUseCase(transactionRepository);

    const app = createApp(
        pino.logger,
        allowedOrigins,
        authenticateUseCase,
        logoutUseCase,
        loginUseCase,
        registerUseCase,
        getCurrentUserUseCase,
        requestEmailVerificationUseCase,
        verifyEmailUseCase,
        createTransactionUseCase,
        getUserTransactionsUseCase,
        getTransactionUseCase,
        updateTransactionUseCase,
        deleteTransactionUseCase,
    );

    await startServer(app, port);
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
