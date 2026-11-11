import type { components } from '../../types.gen.ts';
import type { Transaction } from '../entities/Transaction.ts';

export const TransactionMapper = {
    toEntity: (schema: components['schemas']['Transaction']): Transaction => ({
        id: schema.id,
        userId: schema.userId,
        name: schema.name,
        value: schema.value,
        type: schema.type,
        category: schema.category,
        // A date-only string ("2026-11-11") is parsed as midnight UTC
        date: new Date(schema.date),
        createdAt: new Date(schema.createdAt),
        updatedAt: new Date(schema.updatedAt),
    }),

    // The API takes the calendar day only
    toDateSchema: (date: Date) => date.toISOString().slice(0, 10),
};
