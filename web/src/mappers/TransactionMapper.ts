import type { components } from '../../types.gen.ts';
import type { Transaction } from '../entities/Transaction.ts';

export const TransactionMapper = {
    toEntity: (schema: components['schemas']['Transaction']): Transaction => ({
        id: schema.id,
        userId: schema.userId,
        name: schema.name,
        value: schema.value,
        kind: schema.kind,
        date: { year: schema.date.year, month: schema.date.month, day: schema.date.day },
        createdAt: new Date(schema.createdAt),
        updatedAt: new Date(schema.updatedAt),
    }),
};
