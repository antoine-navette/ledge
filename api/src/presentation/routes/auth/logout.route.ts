import type { FastifyPluginAsync } from 'fastify';
import type { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import type { AuthenticateUseCase } from '../../../application/auth/authenticate.use-case.js';
import type { LogoutUseCase } from '../../../application/auth/logout.use-case.js';
import { isAuthenticated } from '../../middlewares/is-authenticated.middleware.js';
import { unauthorizedSchema } from '../../schemas/unauthorized.schema.js';
import { badRequestSchema } from '../../schemas/bad-request.schema.js';
import { payloadTooLargeSchema } from '../../schemas/payload-too-large.schema.js';
import { tooManyRequestsSchema } from '../../schemas/too-many-requests.schema.js';
import { internalServerErrorSchema } from '../../schemas/internal-server-error.schema.js';

type Options = {
    authenticateUseCase: AuthenticateUseCase;
    logoutUseCase: LogoutUseCase;
};

export const logoutRoute: FastifyPluginAsync<Options> = async (app, { authenticateUseCase, logoutUseCase }) => {
    app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
        method: 'POST',
        url: '/auth/logout',
        schema: {
            tags: ['Auth'],
            response: {
                204: { description: 'User logged out successfully' },
                400: badRequestSchema,
                401: unauthorizedSchema,
                413: payloadTooLargeSchema,
                429: tooManyRequestsSchema,
                500: internalServerErrorSchema,
            },
        } satisfies FastifyZodOpenApiSchema,
        preHandler: isAuthenticated(authenticateUseCase),
        handler: async (request, reply) => {
            await logoutUseCase.execute(request.session);

            reply.clearCookie('session_token', { path: '/' });

            return reply.status(204).send();
        },
    });
};
