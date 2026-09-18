import type { FastifyPluginAsync } from 'fastify';
import type { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import z from 'zod';
import type { VerifyEmailUseCase } from '../../../application/email-verification/verify-email.use-case.js';
import { emailVerificationNotFoundSchema } from '../../schemas/email-verification-not-found.schema.js';
import { tokenExpiredSchema } from '../../schemas/token-expired.schema.js';
import { badRequestSchema } from '../../schemas/bad-request.schema.js';
import { payloadTooLargeSchema } from '../../schemas/payload-too-large.schema.js';
import { tooManyRequestsSchema } from '../../schemas/too-many-requests.schema.js';
import { internalServerErrorSchema } from '../../schemas/internal-server-error.schema.js';

type Options = {
    verifyEmailUseCase: VerifyEmailUseCase;
};

export const deleteEmailVerificationByTokenRoute: FastifyPluginAsync<Options> = async (app, { verifyEmailUseCase }) => {
    app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
        method: 'DELETE',
        url: '/email-verifications/:token',
        schema: {
            tags: ['EmailVerification'],
            params: z.object({
                token: z.string(),
            }),
            response: {
                204: { description: 'Email verified successfully' },
                400: badRequestSchema,
                404: emailVerificationNotFoundSchema,
                410: tokenExpiredSchema,
                413: payloadTooLargeSchema,
                429: tooManyRequestsSchema,
                500: internalServerErrorSchema,
            },
        } satisfies FastifyZodOpenApiSchema,
        handler: async (request, reply) => {
            const result = await verifyEmailUseCase.execute(request.params.token);
            if (!result.success) {
                switch (result.code) {
                    case 'EMAIL_VERIFICATION_NOT_FOUND':
                        request.log.warn({ code: result.code }, 'Not found');
                        return reply.status(404).send({ code: 'EMAIL_VERIFICATION_NOT_FOUND' });
                    case 'TOKEN_EXPIRED':
                        request.log.warn({ code: result.code }, 'Gone');
                        return reply.status(410).send({ code: 'TOKEN_EXPIRED' });
                }
            }
            const user = result.data;

            request.log.info({ userId: user.id }, 'Email verified');
            return reply.status(204).send();
        },
    });
};
