import { formatYearMonthDay } from "../../../shared/utils";

const MONTH_NUMBER_BY_ABBREVIATION = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

/** Given string with day then month then year, where month can be name or number, get in format YYYY-MM-DD */
export const getStandardisedDateText = (rawText: string): string => {
  const match = rawText.match(/^(\d+)[ /.-](\d?\d|[a-z]+)[ /.-](\d\d\d\d)$/i);
  if (match === null) throw new Error(`Unsupported date format: ${rawText}`);
  const dayNumber = Number(match[1]);
  const monthNumber = getMonthNumber(match[2]);
  const yearNumber = Number(match[3]);
  return formatYearMonthDay(yearNumber, monthNumber, dayNumber);
};

const getMonthNumber = (monthText: string): number => {
  const numberMatch = monthText.match(/^\d?\d$/);

  if (numberMatch !== null) return Number(monthText);

  if (monthText.length < 3)
    throw new Error(`Invalid month abbreviation: ${monthText}`);

  const abbreviation = monthText.slice(0, 3);
  const lowerCaseAbbreviation = abbreviation.toLowerCase();

  if (!isMonthAbbrevation(lowerCaseAbbreviation))
    throw new Error(`Unrecognised month: ${monthText}`);

  return MONTH_NUMBER_BY_ABBREVIATION[lowerCaseAbbreviation];
};

const isMonthAbbrevation = (
  x: string
): x is keyof typeof MONTH_NUMBER_BY_ABBREVIATION =>
  x in MONTH_NUMBER_BY_ABBREVIATION;
