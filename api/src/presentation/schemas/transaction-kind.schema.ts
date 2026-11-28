import z from 'zod';

// Sent and returned as a whole: an income has no category field, so one sent with it is an unknown key, dropped like
// any other
export const transactionKindSchema = z
    .discriminatedUnion('type', [
        z.object({ type: z.literal('income') }),
        z.object({ type: z.literal('expense'), category: z.enum(['need', 'want', 'investment']).nullable() }),
    ])
    .meta({ id: 'TransactionKind' });
