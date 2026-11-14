import { writeFile } from 'node:fs/promises';
import { initPino } from '../../src/infrastructure/config/pino.js';
import { loadEnv } from '../../src/infrastructure/config/env.js';
import { createApp } from '../../src/presentation/app.js';
import type { AuthenticateUseCase } from '../../src/application/auth/authenticate.use-case.js';
import type { LogoutUseCase } from '../../src/application/auth/logout.use-case.js';
import type { LoginUseCase } from '../../src/application/auth/login.use-case.js';
import type { RegisterUseCase } from '../../src/application/auth/register.use-case.js';
import type { RequestEmailVerificationUseCase } from '../../src/application/email-verification/request-email-verification.use-case.js';
import type { VerifyEmailUseCase } from '../../src/application/email-verification/verify-email.use-case.js';
import type { CreateTransactionUseCase } from '../../src/application/transaction/create-transaction.use-case.js';
import type { GetUserTransactionsUseCase } from '../../src/application/transaction/get-user-transactions.use-case.js';
import type { GetTransactionUseCase } from '../../src/application/transaction/get-transaction.use-case.js';
import type { UpdateTransactionUseCase } from '../../src/application/transaction/update-transaction.use-case.js';
import type { DeleteTransactionUseCase } from '../../src/application/transaction/delete-transaction.use-case.js';
import 'dotenv/config';

// No logger yet: the logs config itself may be what's wrong. A config error is deterministic and also makes the
// migrations fail during deployment, so it doesn't need to reach Better Stack, unlike a startup failure below (e.g.
// Mongo unreachable)
const env = await Promise.try(loadEnv).catch((err: unknown) => {
    console.error('Failed to load the environment', err);
    process.exit(1);
});

const pino = initPino(env.logs);

// Wrapped in an async function (not awaited at the top level) so the pino transport's
// unref'd worker thread can't make Node think the module has nothing left to settle and
// force-exit with "Detected unsettled top-level await" (exit code 13) before flush() resolves.
const generate = async () => {
    try {
        // No route is ever called: only the schemas attached to each route matter for the OpenAPI spec.
        const app = createApp(
            pino.logger,
            {} as AuthenticateUseCase,
            {} as LogoutUseCase,
            {} as LoginUseCase,
            {} as RegisterUseCase,
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
        pino.logger.fatal({ err }, 'Failed to generate OpenAPI docs');

        await pino.flush();
        process.exit(1);
    }
};

void generate();
