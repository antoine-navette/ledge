import type { FastifyPluginAsync } from 'fastify';
import type { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import z from 'zod';
import type { RequestEmailVerificationUseCase } from '../../../application/email-verification/request-email-verification.use-case.js';
import type { AuthenticateUseCase } from '../../../application/auth/authenticate.use-case.js';
import { isAuthenticated } from '../../middlewares/is-authenticated.middleware.js';
import { unauthorizedSchema } from '../../schemas/unauthorized.schema.js';
import { emailVerificationCooldownActiveSchema } from '../../schemas/email-verification-cooldown-active.schema.js';
import { emailAlreadyVerifiedSchema } from '../../schemas/email-already-verified.schema.js';
import { badRequestSchema } from '../../schemas/bad-request.schema.js';
import { payloadTooLargeSchema } from '../../schemas/payload-too-large.schema.js';
import { unsupportedMediaTypeSchema } from '../../schemas/unsupported-media-type.schema.js';
import { tooManyRequestsSchema } from '../../schemas/too-many-requests.schema.js';
import { internalServerErrorSchema } from '../../schemas/internal-server-error.schema.js';

type Options = {
    requestEmailVerificationUseCase: RequestEmailVerificationUseCase;
    authenticateUseCase: AuthenticateUseCase;
};

export const requestEmailVerificationRoute: FastifyPluginAsync<Options> = async (
    app,
    { requestEmailVerificationUseCase, authenticateUseCase },
) => {
    app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
        method: 'POST',
        url: '/email-verifications',
        schema: {
            tags: ['EmailVerification'],
            response: {
                204: {},
                400: badRequestSchema,
                401: unauthorizedSchema,
                409: z.union([emailVerificationCooldownActiveSchema, emailAlreadyVerifiedSchema]),
                413: payloadTooLargeSchema,
                415: unsupportedMediaTypeSchema,
                429: tooManyRequestsSchema,
                500: internalServerErrorSchema,
            },
        } satisfies FastifyZodOpenApiSchema,
        preHandler: isAuthenticated(authenticateUseCase),
        handler: async (request, reply) => {
            const [, code] = await requestEmailVerificationUseCase.execute(request.session.user);
            if (code) {
                if (code === 'EMAIL_VERIFICATION_COOLDOWN_ACTIVE') {
                    request.log.warn({ code }, 'Conflict');
                    return reply.status(409).send({ code: 'EMAIL_VERIFICATION_COOLDOWN_ACTIVE' });
                }
                if (code === 'EMAIL_ALREADY_VERIFIED') {
                    request.log.warn({ code }, 'Conflict');
                    return reply.status(409).send({ code: 'EMAIL_ALREADY_VERIFIED' });
                }
                return code satisfies never;
            }

            request.log.info('Email verification requested');
            return reply.status(204).send();
        },
    });
};
