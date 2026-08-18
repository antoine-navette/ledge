import type { FastifyPluginAsync } from 'fastify';
import type { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import z from 'zod';
import type { CreateTransactionUseCase } from '../../../application/transaction/create-transaction.use-case.js';
import type { AuthenticateUseCase } from '../../../application/auth/authenticate.use-case.js';
import { isAuthenticated } from '../../middlewares/is-authenticated.middleware.js';
import { transactionSchema } from '../../schemas/transaction.schema.js';
import { badRequestSchema } from '../../schemas/bad-request.schema.js';
import { unauthorizedSchema } from '../../schemas/unauthorized.schema.js';
import { payloadTooLargeSchema } from '../../schemas/payload-too-large.schema.js';
import { tooManyRequestsSchema } from '../../schemas/too-many-requests.schema.js';
import { internalServerErrorSchema } from '../../schemas/internal-server-error.schema.js';
import { TransactionMapper } from '../../mappers/transaction.mapper.js';

type Options = {
    createTransactionUseCase: CreateTransactionUseCase;
    authenticateUseCase: AuthenticateUseCase;
};

export const createTransactionRoute: FastifyPluginAsync<Options> = async (
    app,
    { createTransactionUseCase, authenticateUseCase },
) => {
    app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
        method: 'POST',
        url: '/transactions',
        schema: {
            tags: ['Transaction'],
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
                type: z.enum(['income', 'expense']),
                category: z.enum(['need', 'want', 'investment']).optional(),
                date: z.iso.date().transform((value) => new Date(value)),
            }),
            response: {
                201: transactionSchema,
                400: badRequestSchema,
                401: unauthorizedSchema,
                413: payloadTooLargeSchema,
                429: tooManyRequestsSchema,
                500: internalServerErrorSchema,
            },
        } satisfies FastifyZodOpenApiSchema,
        preHandler: isAuthenticated(authenticateUseCase),
        handler: async (request, reply) => {
            const { name, value, type, category, date } = request.body;

            const transaction = await createTransactionUseCase.execute(
                request.session.userId,
                name,
                value,
                type,
                category,
                date,
            );

            request.log.info({ transactionId: transaction.id }, 'Transaction created');

            return reply.status(201).send(TransactionMapper.toSchema(transaction));
        },
    });
};
