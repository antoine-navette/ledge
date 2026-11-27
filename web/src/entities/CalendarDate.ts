// A day of the calendar, without time nor time zone, like in the API. month goes from 1 to 12, unlike Date's 0 to 11
export type CalendarDate = Readonly<{
    year: number;
    month: number;
    day: number;
}>;
