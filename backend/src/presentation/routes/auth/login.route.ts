import type { FastifyPluginAsync } from 'fastify';
import type { FastifyZodOpenApiSchema, FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import z from 'zod';
import type { LoginUseCase } from '../../../application/auth/login.use-case.js';
import { userSchema } from '../../schemas/user.schema.js';
import { invalidCredentialsSchema } from '../../schemas/invalid-credentials.schema.js';
import { badRequestSchema } from '../../schemas/bad-request.schema.js';
import { payloadTooLargeSchema } from '../../schemas/payload-too-large.schema.js';
import { tooManyRequestsSchema } from '../../schemas/too-many-requests.schema.js';
import { internalServerErrorSchema } from '../../schemas/internal-server-error.schema.js';
import { UserMapper } from '../../mappers/user.mapper.js';

type Options = {
    loginUseCase: LoginUseCase;
};

export const loginRoute: FastifyPluginAsync<Options> = async (app, { loginUseCase }) => {
    app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
        method: 'POST',
        url: '/auth/login',
        schema: {
            tags: ['Auth'],
            body: z.object({
                email: z.email(),
                password: z.string().min(1),
            }),
            response: {
                200: userSchema,
                400: badRequestSchema,
                401: invalidCredentialsSchema,
                413: payloadTooLargeSchema,
                429: tooManyRequestsSchema,
                500: internalServerErrorSchema,
            },
        } satisfies FastifyZodOpenApiSchema,
        handler: async (request, reply) => {
            const { email, password } = request.body;

            const result = await loginUseCase.execute(email, password);
            if (!result.success) {
                switch (result.error) {
                    case 'USER_NOT_FOUND':
                    case 'INVALID_PASSWORD':
                        return reply.status(401).send({ code: 'INVALID_CREDENTIALS' });
                }
            }

            const { user, ...session } = result.data;

            reply.setCookie('sessionToken', session.token, {
                expires: session.expiresAt,
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
            });

            return reply.status(200).send(UserMapper.toSchema(user));
        },
    });
};
