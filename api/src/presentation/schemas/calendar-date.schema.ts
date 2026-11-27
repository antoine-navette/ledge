import z from 'zod';

// Only the types: whether the day exists is CalendarDate's rule, answered with a 422. Strict, so that the request and
// the response share one OpenAPI component: a loose object would accept extra keys as input only, and get a second one
export const calendarDateSchema = z
    .strictObject({
        year: z.int(),
        month: z.int(),
        day: z.int(),
    })
    .meta({ id: 'CalendarDate' });
