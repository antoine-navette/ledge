import type { Router } from 'express';
import type { GetCurrentUserUseCase } from '../../../../application/user/get-current-user.use-case.js';
import type { AuthenticateUseCase } from '../../../../application/auth/authenticate.use-case.js';
import type { Request, Response } from 'express';
import type { ApiSuccess } from '@shared/api/api-response.js';
import { meSchema } from '../../../schemas/user.schemas.js';
import { UnauthorizedError } from '../../errors/unauthorized.error.js';
import { validateOrThrow } from '../../helpers/validate.js';
import type { UserDto } from '@shared/dto/user.dto.js';
import { toUserDto } from '../../../mappers/user.mapper.js';

type Deps = {
    getCurrentUserUseCase: GetCurrentUserUseCase;
    authenticateUseCase: AuthenticateUseCase;
};

export const meRoute = (router: Router, deps: Deps) => {
    /**
     * @openapi
     * /users/me:
     *   get:
     *     tags:
     *       - User
     *     summary: Me
     *     responses:
     *       200:
     *         description: User retrieved successfully
     *       401:
     *         description: Authentication error
     *       500:
     *         description: Internal server error
     */
    router.get('/users/me', meHandler(deps));
};

export const meHandler = ({ getCurrentUserUseCase, authenticateUseCase }: Deps) => {
    return async (req: Request, res: Response): Promise<void> => {
        const { cookies } = validateOrThrow(req, meSchema);

        const authResult = await authenticateUseCase.execute(cookies.sessionToken ?? '');
        if (!authResult.success) throw new UnauthorizedError();

        const result = await getCurrentUserUseCase.execute(authResult.data.userId);
        if (!result.success) {
            switch (result.error) {
                case 'USER_NOT_FOUND':
                    throw new UnauthorizedError();
            }
        }
        const { user } = result.data;

        const response: ApiSuccess<UserDto> = {
            success: true,
            data: toUserDto(user),
        };
        res.status(200).json(response);
    };
};
