import { writeFile } from 'node:fs/promises';
import { createPino } from '../src/infrastructure/config/pino.js';
import { loadEnv, type Env } from '../src/infrastructure/config/env.js';
import { createApp } from '../src/presentation/app.js';
import type { AuthenticateUseCase } from '../src/application/auth/authenticate.use-case.js';
import type { LogoutUseCase } from '../src/application/auth/logout.use-case.js';
import type { LoginUseCase } from '../src/application/auth/login.use-case.js';
import type { RegisterUseCase } from '../src/application/auth/register.use-case.js';
import type { GetCurrentUserUseCase } from '../src/application/user/get-current-user.use-case.js';
import type { RequestEmailVerificationUseCase } from '../src/application/email-verification/request-email-verification.use-case.js';
import type { VerifyEmailUseCase } from '../src/application/email-verification/verify-email.use-case.js';
import type { CreateTransactionUseCase } from '../src/application/transaction/create-transaction.use-case.js';
import type { GetUserTransactionsUseCase } from '../src/application/transaction/get-user-transactions.use-case.js';
import type { GetTransactionUseCase } from '../src/application/transaction/get-transaction.use-case.js';
import type { UpdateTransactionUseCase } from '../src/application/transaction/update-transaction.use-case.js';
import type { DeleteTransactionUseCase } from '../src/application/transaction/delete-transaction.use-case.js';

// .env is not verified yet, but we need a logger now
const pino = createPino(process.env.NODE_ENV as Env['nodeEnv'], process.env.LOKI_URL as Env['lokiUrl']);

// Wrapped in an async function (not awaited at the top level) so the pino transport's
// unref'd worker thread can't make Node think the module has nothing left to settle and
// force-exit with "Detected unsettled top-level await" (exit code 13) before flush() resolves.
const main = async () => {
    try {
        const { allowedOrigins } = loadEnv();
        pino.logger.info('Environment loaded');

        // No route is ever called: only the schemas attached to each route matter for the OpenAPI spec.
        const app = createApp(
            pino.logger,
            allowedOrigins,
            {} as AuthenticateUseCase,
            {} as LogoutUseCase,
            {} as LoginUseCase,
            {} as RegisterUseCase,
            {} as GetCurrentUserUseCase,
            {} as RequestEmailVerificationUseCase,
            {} as VerifyEmailUseCase,
            {} as CreateTransactionUseCase,
            {} as GetUserTransactionsUseCase,
            {} as GetTransactionUseCase,
            {} as UpdateTransactionUseCase,
            {} as DeleteTransactionUseCase,
        );
        await app.ready();

        await writeFile('./openapi.json', JSON.stringify(app.swagger(), null, 4));
        pino.logger.info('OpenAPI spec written to openapi.json');

        await app.close();

        await pino.flush();
        process.exit(0);
    } catch (err) {
        pino.logger.fatal({ err }, err instanceof Error ? err.message : 'Unknown error');

        await pino.flush();
        process.exit(1);
    }
};

void main();
