export const formatDate = (date: Date): string =>
  formatYearMonthDay(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate()
  );

export const formatYearMonthDay = (
  year: number,
  month: number,
  day: number
): string => `${year}-${padZero(month)}-${padZero(day)}`;

export const padZero = (number: number): string => `0${number}`.slice(-2);
