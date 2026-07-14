import type { FastifyPluginAsync } from 'fastify';
import type { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import z from 'zod';
import type { UpdateTransactionUseCase } from '../../../application/transaction/update-transaction.use-case.js';
import type { AuthenticateUseCase } from '../../../application/auth/authenticate.use-case.js';
import { isAuthenticated } from '../../middlewares/is-authenticated.middleware.js';
import { transactionSchema } from '../../schemas/transaction.schema.js';
import { badRequestSchema } from '../../schemas/bad-request.schema.js';
import { unauthorizedSchema } from '../../schemas/unauthorized.schema.js';
import { forbiddenSchema } from '../../schemas/forbidden.schema.js';
import { transactionNotFoundSchema } from '../../schemas/transaction-not-found.schema.js';
import { payloadTooLargeSchema } from '../../schemas/payload-too-large.schema.js';
import { tooManyRequestsSchema } from '../../schemas/too-many-requests.schema.js';
import { internalServerErrorSchema } from '../../schemas/internal-server-error.schema.js';
import { TransactionMapper } from '../../mappers/transaction.mapper.js';

type Options = {
    updateTransactionUseCase: UpdateTransactionUseCase;
    authenticateUseCase: AuthenticateUseCase;
};

export const updateTransactionRoute: FastifyPluginAsync<Options> = async (
    app,
    { updateTransactionUseCase, authenticateUseCase },
) => {
    app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
        method: 'PUT',
        url: '/transactions/:id',
        schema: {
            tags: ['Transaction'],
            params: z.object({
                id: z.string().length(24),
            }),
            body: z.object({
                name: z.string().min(1).max(99),
                value: z
                    .number()
                    .min(0.01)
                    .refine((val) => {
                        // We cannot return Number.isInteger(val * 100)
                        // It doesn't work with some values (ex.: 542.42) due to binary conversions
                        const str = val.toString();
                        const decimals = str.split('.')[1];
                        return !decimals || decimals.length <= 2;
                    })
                    .max(999999999.99),
                type: z.enum(['expense', 'income']),
                expenseCategory: z.enum(['need', 'want', 'investment']).optional(),
            }),
            response: {
                200: transactionSchema,
                400: badRequestSchema,
                401: unauthorizedSchema,
                403: forbiddenSchema,
                404: transactionNotFoundSchema,
                413: payloadTooLargeSchema,
                429: tooManyRequestsSchema,
                500: internalServerErrorSchema,
            },
        } satisfies FastifyZodOpenApiSchema,
        preHandler: isAuthenticated(authenticateUseCase),
        handler: async (request, reply) => {
            const { name, value, type, expenseCategory } = request.body;

            const result = await updateTransactionUseCase.execute(
                request.params.id,
                request.session.userId,
                name,
                value,
                type,
                expenseCategory,
            );
            if (!result.success) {
                switch (result.error) {
                    case 'TRANSACTION_NOT_OWNED':
                        return reply.status(403).send({ code: 'FORBIDDEN' });
                    case 'TRANSACTION_NOT_FOUND':
                        return reply.status(404).send({ code: 'TRANSACTION_NOT_FOUND' });
                }
            }

            return reply.status(200).send(TransactionMapper.toSchema(result.data));
        },
    });
};
