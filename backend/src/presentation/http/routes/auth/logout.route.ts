import type { Router } from 'express';
import type { Request, Response } from 'express';
import type { AuthenticateUseCase } from '../../../../application/auth/authenticate.use-case.js';
import type { LogoutUseCase } from '../../../../application/auth/logout.use-case.js';
import { clearSessionCookie } from '../../helpers/cookies.js';
import type { ApiSuccess } from '@shared/api/api-response.js';
import { logoutSchema } from '../../../schemas/auth.schemas.js';
import { UnauthorizedError } from '../../errors/unauthorized.error.js';
import { validateOrThrow } from '../../helpers/validate.js';

type Deps = {
    authenticateUseCase: AuthenticateUseCase;
    logoutUseCase: LogoutUseCase;
};

export const logoutRoute = (router: Router, deps: Deps) => {
    /**
     * @openapi
     * /auth/logout:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Logout
     *     responses:
     *       200:
     *         description: User logged out successfully
     *       401:
     *         description: Authentication error
     *       500:
     *         description: Internal server error
     */
    router.post('/auth/logout', logoutHandler(deps));
};

export const logoutHandler = ({ authenticateUseCase, logoutUseCase }: Deps) => {
    return async (req: Request, res: Response) => {
        const { cookies } = validateOrThrow(req, logoutSchema);

        const authResult = await authenticateUseCase.execute(cookies.sessionToken ?? '');
        if (!authResult.success) throw new UnauthorizedError();

        clearSessionCookie(res);
        await logoutUseCase.execute(authResult.data);

        const response: ApiSuccess = {
            success: true,
        };
        res.status(200).json(response);
    };
};
