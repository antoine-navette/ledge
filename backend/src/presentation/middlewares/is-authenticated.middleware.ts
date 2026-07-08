import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthenticateUseCase } from '../../application/auth/authenticate.use-case.js';
import type { Session } from '../../domain/entities/session.js';
import type { UnauthorizedSchema } from '../schemas/unauthorized.schema.js';

declare module 'fastify' {
    interface FastifyRequest {
        session: Session;
    }
}

export const isAuthenticated = (authenticateUseCase: AuthenticateUseCase) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const sessionToken = request.cookies.sessionToken;
        if (!sessionToken) {
            request.log.warn('Unauthorized');
            return reply.status(401).send({ code: 'UNAUTHORIZED' } satisfies UnauthorizedSchema);
        }

        const result = await authenticateUseCase.execute(sessionToken);
        if (!result.success) {
            request.log.warn({ err: result.error }, 'Unauthorized');
            return reply.status(401).send({ code: 'UNAUTHORIZED' } satisfies UnauthorizedSchema);
        }

        request.session = result.data;
    };
};
