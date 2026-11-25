import type { FastifyPluginAsync } from 'fastify';
import type { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import z from 'zod';
import type { VerifyEmailUseCase } from '../../../application/email-verification/verify-email.use-case.js';
import { emailVerificationNotFoundSchema } from '../../schemas/email-verification-not-found.schema.js';
import { emailVerificationExpiredSchema } from '../../schemas/email-verification-expired.schema.js';
import { badRequestSchema } from '../../schemas/bad-request.schema.js';
import { payloadTooLargeSchema } from '../../schemas/payload-too-large.schema.js';
import { unsupportedMediaTypeSchema } from '../../schemas/unsupported-media-type.schema.js';
import { tooManyRequestsSchema } from '../../schemas/too-many-requests.schema.js';
import { internalServerErrorSchema } from '../../schemas/internal-server-error.schema.js';

type Options = {
    verifyEmailUseCase: VerifyEmailUseCase;
};

export const verifyEmailRoute: FastifyPluginAsync<Options> = async (app, { verifyEmailUseCase }) => {
    app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
        method: 'POST',
        url: '/email-verifications/:token/verify',
        schema: {
            tags: ['EmailVerification'],
            params: z.object({
                token: z.string(),
            }),
            response: {
                204: {},
                400: badRequestSchema,
                404: emailVerificationNotFoundSchema,
                410: emailVerificationExpiredSchema,
                413: payloadTooLargeSchema,
                415: unsupportedMediaTypeSchema,
                429: tooManyRequestsSchema,
                500: internalServerErrorSchema,
            },
        } satisfies FastifyZodOpenApiSchema,
        handler: async (request, reply) => {
            const [user, code] = await verifyEmailUseCase.execute(request.params.token);
            if (code) {
                if (code === 'EMAIL_VERIFICATION_NOT_FOUND') {
                    request.log.warn({ code }, 'Not found');
                    return reply.status(404).send({ code: 'EMAIL_VERIFICATION_NOT_FOUND' });
                }
                if (code === 'EMAIL_VERIFICATION_EXPIRED') {
                    request.log.warn({ code }, 'Gone');
                    return reply.status(410).send({ code: 'EMAIL_VERIFICATION_EXPIRED' });
                }
                return code satisfies never;
            }

            request.log.info({ userId: user.id }, 'Email verified');
            return reply.status(204).send();
        },
    });
};
