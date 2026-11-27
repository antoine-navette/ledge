import { CalendarDate } from '../../../domain/value-objects/calendar-date.js';
import type { MongoCalendarDateDocument } from '../documents/mongo.calendar-date.document.js';

export const MongoCalendarDateMapper = {
    toInfrastructure: (date: CalendarDate): MongoCalendarDateDocument => ({
        year: date.year,
        month: date.month,
        day: date.day,
    }),

    toDomain: (document: MongoCalendarDateDocument): CalendarDate =>
        CalendarDate.reconstitute(document.year, document.month, document.day),
};
