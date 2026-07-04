import type { Router } from 'express';
import type { GetTransactionUseCase } from '../../../../application/transaction/get-transaction.use-case.js';
import type { AuthenticateUseCase } from '../../../../application/auth/authenticate.use-case.js';
import type { Request, Response } from 'express';
import { readTransactionSchema } from '../../../schemas/transaction.schemas.js';
import type { ApiSuccess } from '@shared/api/api-response.js';
import { ForbiddenError } from '../../errors/forbidden.error.js';
import { TransactionNotFoundError } from '../../errors/transaction-not-found.error.js';
import { UnauthorizedError } from '../../errors/unauthorized.error.js';
import { validateOrThrow } from '../../helpers/validate.js';
import type { TransactionDto } from '@shared/dto/transaction.dto.js';
import { toTransactionDto } from '../../../mappers/transaction.mapper.js';

type Deps = {
    getTransactionUseCase: GetTransactionUseCase;
    authenticateUseCase: AuthenticateUseCase;
};

export const readTransactionRoute = (router: Router, deps: Deps) => {
    /**
     * @openapi
     * /transactions/:transactionId:
     *   get:
     *     tags:
     *       - Transaction
     *     summary: Read transaction
     *     responses:
     *       200:
     *         description: Transaction retrieved successfully
     *       400:
     *         description: Validation error
     *       401:
     *         description: Authentication error
     *       403:
     *         description: Forbidden access
     *       404:
     *         description: Transaction not found
     *       500:
     *         description: Internal server error
     */
    router.get('/transactions/:transactionId', readTransactionHandler(deps));
};

export const readTransactionHandler = ({ getTransactionUseCase, authenticateUseCase }: Deps) => {
    return async (req: Request, res: Response) => {
        const { params, cookies } = validateOrThrow(req, readTransactionSchema);

        const authResult = await authenticateUseCase.execute(cookies.sessionToken ?? '');
        if (!authResult.success) throw new UnauthorizedError();

        const result = await getTransactionUseCase.execute(params.transactionId, authResult.data.userId);
        if (!result.success) {
            switch (result.error) {
                case 'TRANSACTION_NOT_OWNED':
                    throw new ForbiddenError();
                case 'TRANSACTION_NOT_FOUND':
                    throw new TransactionNotFoundError();
            }
        }
        const { transaction } = result.data;

        const response: ApiSuccess<TransactionDto> = {
            success: true,
            data: toTransactionDto(transaction),
        };
        res.status(200).json(response);
    };
};
