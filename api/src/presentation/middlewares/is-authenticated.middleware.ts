import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthenticateUseCase } from '../../application/auth/authenticate.use-case.js';
import { SESSION_COOKIE_NAME } from '../constants/session-cookie.js';
import type { UnauthorizedSchema } from '../schemas/unauthorized.schema.js';

export const isAuthenticated = (authenticateUseCase: AuthenticateUseCase) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const sessionToken = request.cookies[SESSION_COOKIE_NAME];
        if (!sessionToken) {
            request.log.warn('Unauthorized');
            return reply.status(401).send({ code: 'UNAUTHORIZED' } satisfies UnauthorizedSchema);
        }

        const result = await authenticateUseCase.execute(sessionToken);
        if (!result.success) {
            request.log.warn({ code: result.code }, 'Unauthorized');
            return reply.status(401).send({ code: 'UNAUTHORIZED' } satisfies UnauthorizedSchema);
        }
        const session = result.data;

        request.session = session;
        request.log = request.log.child({ sessionId: session.id, userId: session.userId });
        reply.setSessionCookie(session);
    };
};
