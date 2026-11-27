// A day of the calendar, without time nor time zone: the same day wherever it is read
export class CalendarDate {
    // Never set at runtime: only makes the class nominal, so a plain { year, month, day } object can't be passed off as
    // a CalendarDate without going through its factories
    declare private readonly brand: 'CalendarDate';

    private constructor(
        public readonly year: number,
        // 1 to 12, unlike Date's 0 to 11
        public readonly month: number,
        public readonly day: number,
    ) {}

    static create = (year: number, month: number, day: number) => {
        if (
            !Number.isInteger(year) ||
            year < 1 ||
            year > 9999 ||
            !Number.isInteger(month) ||
            month < 1 ||
            month > 12 ||
            !Number.isInteger(day) ||
            day < 1 ||
            day > CalendarDate.daysInMonth(year, month)
        ) {
            return [null, 'CALENDAR_DATE_INVALID'] as const;
        }

        return [new CalendarDate(year, month, day), null] as const;
    };

    // The day an instant falls on in UTC
    static fromUtc = (instant: Date) => {
        return new CalendarDate(instant.getUTCFullYear(), instant.getUTCMonth() + 1, instant.getUTCDate());
    };

    static reconstitute = (year: number, month: number, day: number) => {
        return new CalendarDate(year, month, day);
    };

    isAfter = (other: CalendarDate) => {
        if (this.year !== other.year) return this.year > other.year;
        if (this.month !== other.month) return this.month > other.month;
        return this.day > other.day;
    };

    private static daysInMonth = (year: number, month: number) => {
        if (month === 2) {
            const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
            return isLeapYear ? 29 : 28;
        }
        return [4, 6, 9, 11].includes(month) ? 30 : 31;
    };
}
