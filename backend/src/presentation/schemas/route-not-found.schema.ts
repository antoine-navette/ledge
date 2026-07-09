import z from 'zod';

export const routeNotFoundSchema = z
    .object({
        code: z.literal('ROUTE_NOT_FOUND'),
    })
    .meta({ id: 'RouteNotFound' });

export type RouteNotFoundSchema = z.output<typeof routeNotFoundSchema>;