import type { FastifyPluginAsync } from 'fastify';
import type { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import z from 'zod';
import type { GetUserTransactionsUseCase } from '../../../application/transaction/get-user-transactions.use-case.js';
import type { AuthenticateUseCase } from '../../../application/auth/authenticate.use-case.js';
import { isAuthenticated } from '../../middlewares/is-authenticated.middleware.js';
import { transactionSchema } from '../../schemas/transaction.schema.js';
import { badRequestSchema } from '../../schemas/bad-request.schema.js';
import { unauthorizedSchema } from '../../schemas/unauthorized.schema.js';
import { tooManyRequestsSchema } from '../../schemas/too-many-requests.schema.js';
import { internalServerErrorSchema } from '../../schemas/internal-server-error.schema.js';
import { TransactionPresenter } from '../../presenters/transaction.presenter.js';

type Options = {
    getUserTransactionsUseCase: GetUserTransactionsUseCase;
    authenticateUseCase: AuthenticateUseCase;
};

export const getUserTransactionsRoute: FastifyPluginAsync<Options> = async (
    app,
    { getUserTransactionsUseCase, authenticateUseCase },
) => {
    app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
        method: 'GET',
        url: '/transactions',
        schema: {
            tags: ['Transaction'],
            // Only the types: a filter matching nothing (month 13) just finds nothing. Coerced since a query string only
            // holds text, which also lets loose forms through (" 2026", "02"): harmless, they read as the same number
            querystring: z.object({
                year: z.coerce.number().int(),
                month: z.coerce.number().int(),
            }),
            response: {
                200: z.array(transactionSchema),
                400: badRequestSchema,
                401: unauthorizedSchema,
                429: tooManyRequestsSchema,
                500: internalServerErrorSchema,
            },
        } satisfies FastifyZodOpenApiSchema,
        preHandler: isAuthenticated(authenticateUseCase),
        handler: async (request, reply) => {
            const { year, month } = request.query;

            const transactions = await getUserTransactionsUseCase.execute(request.session.userId, year, month);

            return reply.status(200).send(transactions.map(TransactionPresenter.toSchema));
        },
    });
};
