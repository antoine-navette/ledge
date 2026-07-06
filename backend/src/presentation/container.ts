import type { PasswordHasher } from '../domain/ports/password-hasher.js';
import type { EmailSender } from '../domain/ports/email-sender.js';
import type { UserRepository } from '../domain/repositories/user.repository.js';
import type { SessionRepository } from '../domain/repositories/session.repository.js';
import type { EmailVerificationRepository } from '../domain/repositories/email-verification.repository.js';
import type { TransactionRepository } from '../domain/repositories/transaction.repository.js';
import type { IdGenerator } from '../domain/ports/id-generator.js';
import type { TokenGenerator } from '../domain/ports/token-generator.js';
import type { Env } from '../infrastructure/config/env.js';
import { AuthenticateUseCase } from '../application/auth/authenticate.use-case.js';
import { RegisterUseCase } from '../application/auth/register.use-case.js';
import { LoginUseCase } from '../application/auth/login.use-case.js';
import { LogoutUseCase } from '../application/auth/logout.use-case.js';
import { CreateTransactionUseCase } from '../application/transaction/create-transaction.use-case.js';
import { GetUserTransactionsUseCase } from '../application/transaction/get-user-transactions.use-case.js';
import { GetTransactionUseCase } from '../application/transaction/get-transaction.use-case.js';
import { UpdateTransactionUseCase } from '../application/transaction/update-transaction.use-case.js';
import { DeleteTransactionUseCase } from '../application/transaction/delete-transaction.use-case.js';
import { RequestEmailVerificationUseCase } from '../application/email-verification/request-email-verification.use-case.js';
import { VerifyEmailUseCase } from '../application/email-verification/verify-email.use-case.js';
import { GetCurrentUserUseCase } from '../application/user/get-current-user.use-case.js';

type Input = {
    passwordHasher: PasswordHasher;
    emailSender: EmailSender;
    idGenerator: IdGenerator;
    tokenGenerator: TokenGenerator;
    userRepository: UserRepository;
    sessionRepository: SessionRepository;
    emailVerificationRepository: EmailVerificationRepository;
    transactionRepository: TransactionRepository;
    emailFrom: Env['emailFrom'];
    webUrl: Env['webUrl'];
};

export const buildContainer = ({
    passwordHasher,
    emailSender,
    idGenerator,
    tokenGenerator,
    userRepository,
    sessionRepository,
    emailVerificationRepository,
    transactionRepository,
    emailFrom,
    webUrl,
}: Input) => {
    return {
        authenticateUseCase: new AuthenticateUseCase(sessionRepository),
        registerUseCase: new RegisterUseCase(userRepository, sessionRepository, passwordHasher, idGenerator, tokenGenerator),
        loginUseCase: new LoginUseCase(userRepository, sessionRepository, passwordHasher, idGenerator, tokenGenerator),
        logoutUseCase: new LogoutUseCase(sessionRepository),

        createTransactionUseCase: new CreateTransactionUseCase(transactionRepository, idGenerator),
        getUserTransactionsUseCase: new GetUserTransactionsUseCase(transactionRepository),
        getTransactionUseCase: new GetTransactionUseCase(transactionRepository),
        updateTransactionUseCase: new UpdateTransactionUseCase(transactionRepository),
        deleteTransactionUseCase: new DeleteTransactionUseCase(transactionRepository),

        requestEmailVerificationUseCase: new RequestEmailVerificationUseCase(
            userRepository,
            emailVerificationRepository,
            emailSender,
            idGenerator,
            tokenGenerator,
            emailFrom,
            webUrl,
        ),
        verifyEmailUseCase: new VerifyEmailUseCase(userRepository, emailVerificationRepository),
        getCurrentUserUseCase: new GetCurrentUserUseCase(userRepository),
    };
};