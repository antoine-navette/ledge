import type { Router } from 'express';
import type { CreateTransactionUseCase } from '../../../../application/transaction/create-transaction.use-case.js';
import type { AuthenticateUseCase } from '../../../../application/auth/authenticate.use-case.js';
import type { Request, Response } from 'express';
import { createTransactionSchema } from '../../../schemas/transaction.schemas.js';
import type { ApiSuccess } from '@shared/api/api-response.js';
import { UnauthorizedError } from '../../errors/unauthorized.error.js';
import { validateOrThrow } from '../../helpers/validate.js';
import type { TransactionDto } from '@shared/dto/transaction.dto.js';
import { toTransactionDto } from '../../../mappers/transaction.mapper.js';

type Deps = {
    createTransactionUseCase: CreateTransactionUseCase;
    authenticateUseCase: AuthenticateUseCase;
};

export const createTransactionRoute = (router: Router, deps: Deps) => {
    /**
     * @openapi
     * /transactions:
     *   post:
     *     tags:
     *       - Transaction
     *     summary: Create transaction
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - month
     *               - name
     *               - value
     *               - type
     *             properties:
     *               month:
     *                 type: string
     *               name:
     *                 type: string
     *               value:
     *                 type: number
     *               type:
     *                 type: string
     *                 enum: [income, expense]
     *     responses:
     *       201:
     *         description: Transaction created successfully
     *       400:
     *         description: Validation error
     *       401:
     *         description: Authentication error
     *       500:
     *         description: Internal server error
     */
    router.post('/transactions', createTransactionHandler(deps));
};

export const createTransactionHandler = ({ createTransactionUseCase, authenticateUseCase }: Deps) => {
    return async (req: Request, res: Response) => {
        const { body, cookies } = validateOrThrow(req, createTransactionSchema);

        const authResult = await authenticateUseCase.execute(cookies.sessionToken ?? '');
        if (!authResult.success) throw new UnauthorizedError();

        const transaction = await createTransactionUseCase.execute(
            authResult.data.userId,
            body.month,
            body.name,
            body.value,
            body.type,
            body.expenseCategory,
        );

        const response: ApiSuccess<TransactionDto> = {
            success: true,
            data: toTransactionDto(transaction),
        };
        res.status(201).json(response);
    };
};
