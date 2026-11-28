import z from 'zod';

// Only the types: whether the day exists is CalendarDate's rule, answered with a 422
export const calendarDateSchema = z
    .object({
        year: z.int(),
        month: z.int(),
        day: z.int(),
    })
    .meta({ id: 'CalendarDate' });
