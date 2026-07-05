import type { Router } from 'express';
import type { UpdateTransactionUseCase } from '../../../../application/transaction/update-transaction.use-case.js';
import type { AuthenticateUseCase } from '../../../../application/auth/authenticate.use-case.js';
import type { Request, Response } from 'express';
import { updateTransactionSchema } from '../../../schemas/transaction.schemas.js';
import type { ApiSuccess } from '@shared/api/api-response.js';
import { ForbiddenError } from '../../errors/forbidden.error.js';
import { TransactionNotFoundError } from '../../errors/transaction-not-found.error.js';
import { UnauthorizedError } from '../../errors/unauthorized.error.js';
import { validateOrThrow } from '../../helpers/validate.js';
import type { TransactionDto } from '@shared/dto/transaction.dto.js';
import { toTransactionDto } from '../../../mappers/transaction.mapper.js';

type Deps = {
    updateTransactionUseCase: UpdateTransactionUseCase;
    authenticateUseCase: AuthenticateUseCase;
};

export const updateTransactionRoute = (router: Router, deps: Deps) => {
    /**
     * @openapi
     * /transactions/:transactionId:
     *   put:
     *     tags:
     *       - Transaction
     *     summary: Update transaction
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - value
     *               - type
     *             properties:
     *               name:
     *                 type: string
     *               value:
     *                 type: number
     *               type:
     *                 type: string
     *                 enum: [income, expense]
     *     responses:
     *       200:
     *         description: Transaction updated successfully
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
    router.put('/transactions/:transactionId', updateTransactionHandler(deps));
};

export const updateTransactionHandler = ({ updateTransactionUseCase, authenticateUseCase }: Deps) => {
    return async (req: Request, res: Response) => {
        const { body, params, cookies } = validateOrThrow(req, updateTransactionSchema);

        const authResult = await authenticateUseCase.execute(cookies.sessionToken ?? '');
        if (!authResult.success) throw new UnauthorizedError();

        const result = await updateTransactionUseCase.execute(
            params.transactionId,
            authResult.data.userId,
            body.name,
            body.value,
            body.type,
            body.expenseCategory,
        );
        if (!result.success) {
            switch (result.error) {
                case 'TRANSACTION_NOT_OWNED':
                    throw new ForbiddenError();
                case 'TRANSACTION_NOT_FOUND':
                    throw new TransactionNotFoundError();
            }
        }
        const transaction = result.data;

        const response: ApiSuccess<TransactionDto> = {
            success: true,
            data: toTransactionDto(transaction),
        };
        res.status(200).json(response);
    };
};
