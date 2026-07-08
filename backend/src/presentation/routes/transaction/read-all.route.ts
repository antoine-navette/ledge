import type { FastifyPluginAsync } from 'fastify';
import type { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import z from 'zod';
import type { GetUserTransactionsUseCase } from '../../../application/transaction/get-user-transactions.use-case.js';
import type { AuthenticateUseCase } from '../../../application/auth/authenticate.use-case.js';
import { isAuthenticated } from '../../middlewares/is-authenticated.middleware.js';
import { transactionSchema } from '../../schemas/transaction.schema.js';
import { unauthorizedSchema } from '../../schemas/unauthorized.schema.js';
import { tooManyRequestsSchema } from '../../schemas/too-many-requests.schema.js';
import { internalServerErrorSchema } from '../../schemas/internal-server-error.schema.js';
import { TransactionMapper } from '../../mappers/transaction.mapper.js';

type Options = {
    getUserTransactionsUseCase: GetUserTransactionsUseCase;
    authenticateUseCase: AuthenticateUseCase;
};

export const readAllTransactionRoute: FastifyPluginAsync<Options> = async (
    app,
    { getUserTransactionsUseCase, authenticateUseCase },
) => {
    app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
        method: 'GET',
        url: '/transactions',
        schema: {
            tags: ['Transaction'],
            response: {
                200: z.array(transactionSchema),
                401: unauthorizedSchema,
                429: tooManyRequestsSchema,
                500: internalServerErrorSchema,
            },
        } satisfies FastifyZodOpenApiSchema,
        preHandler: isAuthenticated(authenticateUseCase),
        handler: async (request, reply) => {
            const transactions = await getUserTransactionsUseCase.execute(request.session.userId);

            return reply.status(200).send(transactions.map(TransactionMapper.toSchema));
        },
    });
};