import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import {
    fastifyZodOpenApiPlugin,
    fastifyZodOpenApiTransformers,
    serializerCompiler,
    validatorCompiler,
} from 'fastify-zod-openapi';
import type { Logger } from 'pino';
import type { Env } from '../infrastructure/config/env.js';
import type { AuthenticateUseCase } from '../application/auth/authenticate.use-case.js';
import type { LogoutUseCase } from '../application/auth/logout.use-case.js';
import type { LoginUseCase } from '../application/auth/login.use-case.js';
import type { RegisterUseCase } from '../application/auth/register.use-case.js';
import type { GetCurrentUserUseCase } from '../application/user/get-current-user.use-case.js';
import type { RequestEmailVerificationUseCase } from '../application/email-verification/request-email-verification.use-case.js';
import type { VerifyEmailUseCase } from '../application/email-verification/verify-email.use-case.js';
import type { CreateTransactionUseCase } from '../application/transaction/create-transaction.use-case.js';
import type { GetUserTransactionsUseCase } from '../application/transaction/get-user-transactions.use-case.js';
import type { GetTransactionUseCase } from '../application/transaction/get-transaction.use-case.js';
import type { UpdateTransactionUseCase } from '../application/transaction/update-transaction.use-case.js';
import type { DeleteTransactionUseCase } from '../application/transaction/delete-transaction.use-case.js';
import { registerRoute } from './routes/auth/register.route.js';
import { loginRoute } from './routes/auth/login.route.js';
import { logoutRoute } from './routes/auth/logout.route.js';
import { meRoute } from './routes/user/me.route.js';
import { createEmailVerificationRoute } from './routes/email-verification/create.route.js';
import { deleteEmailVerificationRoute } from './routes/email-verification/delete.route.js';
import { createTransactionRoute } from './routes/transaction/create.route.js';
import { readTransactionsRoute } from './routes/transaction/read.route.js';
import { readTransactionByIdRoute } from './routes/transaction/read-by-id.route.js';
import { updateTransactionRoute } from './routes/transaction/update.route.js';
import { deleteTransactionRoute } from './routes/transaction/delete.route.js';
import type { RouteNotFoundSchema } from './schemas/route-not-found.schema.js';
import type { BadRequestSchema } from './schemas/bad-request.schema.js';
import type { PayloadTooLargeSchema } from './schemas/payload-too-large.schema.js';
import type { TooManyRequestsSchema } from './schemas/too-many-requests.schema.js';
import type { InternalServerErrorSchema } from './schemas/internal-server-error.schema.js';

export const createApp = (
    logger: Logger,
    allowedOrigins: Env['allowedOrigins'],
    authenticateUseCase: AuthenticateUseCase,
    logoutUseCase: LogoutUseCase,
    loginUseCase: LoginUseCase,
    registerUseCase: RegisterUseCase,
    getCurrentUserUseCase: GetCurrentUserUseCase,
    requestEmailVerificationUseCase: RequestEmailVerificationUseCase,
    verifyEmailUseCase: VerifyEmailUseCase,
    createTransactionUseCase: CreateTransactionUseCase,
    getUserTransactionsUseCase: GetUserTransactionsUseCase,
    getTransactionUseCase: GetTransactionUseCase,
    updateTransactionUseCase: UpdateTransactionUseCase,
    deleteTransactionUseCase: DeleteTransactionUseCase,
) => {
    const app = Fastify({
        loggerInstance: logger,
        disableRequestLogging: true,
        trustProxy: true,
        bodyLimit: 100 * 1024,
    });

    // Logging
    app.addHook('onRequest', async (request) => {
        request.log = request.log.child({
            method: request.method,
            url: request.url,
            route: request.routeOptions.url,
        });
    });

    // Security
    app.register(fastifyCors, {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    });
    app.register(fastifyRateLimit, {
        max: 60,
        timeWindow: '1 minute',
    });

    // Parsing
    app.register(fastifyCookie);

    // OpenAPI (validation, serialization — needed in every env)
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    app.register(fastifyZodOpenApiPlugin);
    app.register(fastifySwagger, {
        openapi: {
            openapi: '3.1.0',
            info: {
                title: 'Ledge API',
                version: '1.0.0',
            },
        },
        ...fastifyZodOpenApiTransformers,
    });
    app.register(fastifySwaggerUi, {
        routePrefix: '/docs',
    });

    // Routes
    app.register(registerRoute, { registerUseCase });
    app.register(loginRoute, { loginUseCase });
    app.register(logoutRoute, { authenticateUseCase, logoutUseCase });
    app.register(meRoute, { getCurrentUserUseCase, authenticateUseCase });
    app.register(createEmailVerificationRoute, { requestEmailVerificationUseCase, authenticateUseCase });
    app.register(deleteEmailVerificationRoute, { verifyEmailUseCase });
    app.register(createTransactionRoute, { createTransactionUseCase, authenticateUseCase });
    app.register(readTransactionsRoute, { getUserTransactionsUseCase, authenticateUseCase });
    app.register(readTransactionByIdRoute, { getTransactionUseCase, authenticateUseCase });
    app.register(updateTransactionRoute, { updateTransactionUseCase, authenticateUseCase });
    app.register(deleteTransactionRoute, { deleteTransactionUseCase, authenticateUseCase });

    // Not found
    app.setNotFoundHandler(async (request, reply) => {
        request.log.warn('Route not found');
        return reply.status(404).send({ code: 'ROUTE_NOT_FOUND' } satisfies RouteNotFoundSchema);
    });

    // Error handler
    app.setErrorHandler(async (err, request, reply) => {
        // Malformed/empty JSON body on any bodywith route (POST/PUT/PATCH/DELETE/OPTIONS) even without a body
        // schema, or a zod validation failure (body/params/querystring) on any route with an input schema.
        if (err instanceof Error && 'statusCode' in err && err.statusCode === 400) {
            request.log.warn({ err }, err.message);
            return reply.status(400).send({ code: 'BAD_REQUEST' } satisfies BadRequestSchema);
        }

        // Body over bodyLimit — only possible on bodywith routes (POST/PUT/PATCH/DELETE/OPTIONS); GET/HEAD/TRACE
        // never attempt to parse a body at all, regardless of whether the route declares one.
        if (err instanceof Error && 'statusCode' in err && err.statusCode === 413) {
            request.log.warn({ err }, err.message);
            return reply.status(413).send({ code: 'PAYLOAD_TOO_LARGE' } satisfies PayloadTooLargeSchema);
        }

        if (err instanceof Error && 'statusCode' in err && err.statusCode === 429) {
            request.log.warn({ err }, err.message);
            return reply.status(429).send({ code: 'TOO_MANY_REQUESTS' } satisfies TooManyRequestsSchema);
        }

        request.log.error({ err }, err instanceof Error ? err.message : 'Unknown error');
        return reply.status(500).send({ code: 'INTERNAL_SERVER_ERROR' } satisfies InternalServerErrorSchema);
    });

    return app;
};
