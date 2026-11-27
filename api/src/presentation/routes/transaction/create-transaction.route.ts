import type { FastifyPluginAsync } from 'fastify';
import type { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import z from 'zod';
import type { CreateTransactionUseCase } from '../../../application/transaction/create-transaction.use-case.js';
import type { AuthenticateUseCase } from '../../../application/auth/authenticate.use-case.js';
import { isAuthenticated } from '../../middlewares/is-authenticated.middleware.js';
import { transactionSchema } from '../../schemas/transaction.schema.js';
import { calendarDateSchema } from '../../schemas/calendar-date.schema.js';
import { badRequestSchema } from '../../schemas/bad-request.schema.js';
import { unauthorizedSchema } from '../../schemas/unauthorized.schema.js';
import { payloadTooLargeSchema } from '../../schemas/payload-too-large.schema.js';
import { unsupportedMediaTypeSchema } from '../../schemas/unsupported-media-type.schema.js';
import { tooManyRequestsSchema } from '../../schemas/too-many-requests.schema.js';
import { internalServerErrorSchema } from '../../schemas/internal-server-error.schema.js';
import { TransactionPresenter } from '../../presenters/transaction.presenter.js';
import { unprocessableContentSchema } from '../../schemas/unprocessable-content.schema.js';

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
                name: z.string(),
                value: z.number(),
                type: z.enum(['income', 'expense']),
                category: z.enum(['need', 'want', 'investment']).nullable(),
                date: calendarDateSchema,
            }),
            response: {
                201: transactionSchema,
                400: badRequestSchema,
                401: unauthorizedSchema,
                413: payloadTooLargeSchema,
                415: unsupportedMediaTypeSchema,
                422: unprocessableContentSchema,
                429: tooManyRequestsSchema,
                500: internalServerErrorSchema,
            },
        } satisfies FastifyZodOpenApiSchema,
        preHandler: isAuthenticated(authenticateUseCase),
        handler: async (request, reply) => {
            const { name, value, type, category, date } = request.body;

            const [transaction, code] = await createTransactionUseCase.execute(
                request.session.userId,
                name,
                value,
                type,
                category,
                date,
            );
            if (code) {
                if (
                    code === 'TRANSACTION_NAME_INVALID' ||
                    code === 'TRANSACTION_VALUE_INVALID' ||
                    code === 'TRANSACTION_CATEGORY_INVALID' ||
                    code === 'TRANSACTION_DATE_INVALID' ||
                    code === 'CALENDAR_DATE_INVALID'
                ) {
                    request.log.warn({ code }, 'Unprocessable content');
                    return reply.status(422).send({ code: 'UNPROCESSABLE_CONTENT' });
                }
                return code satisfies never;
            }

            request.log.info({ transactionId: transaction.id }, 'Transaction created');
            return reply.status(201).send(TransactionPresenter.toSchema(transaction));
        },
    });
};
