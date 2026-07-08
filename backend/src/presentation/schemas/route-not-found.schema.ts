import z from 'zod';

export const routeNotFoundSchema = z.object({
    code: z.literal('ROUTE_NOT_FOUND'),
});

export type RouteNotFoundSchema = z.output<typeof routeNotFoundSchema>;