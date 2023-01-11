import { getStandardisedDateText } from "./get-standardised-date-text";

describe("Standardised date text getter", () => {
  test.each`
    givenRawText          | expectedResult
    ${"1 2 2000"}         | ${"2000-02-01"}
    ${"01 02 2000"}       | ${"2000-02-01"}
    ${"11 12 2000"}       | ${"2000-12-11"}
    ${"1/2/2000"}         | ${"2000-02-01"}
    ${"01/02/2000"}       | ${"2000-02-01"}
    ${"11/12/2000"}       | ${"2000-12-11"}
    ${"1.2.2000"}         | ${"2000-02-01"}
    ${"01.02.2000"}       | ${"2000-02-01"}
    ${"11.12.2000"}       | ${"2000-12-11"}
    ${"1-2-2000"}         | ${"2000-02-01"}
    ${"01-02-2000"}       | ${"2000-02-01"}
    ${"11-12-2000"}       | ${"2000-12-11"}
    ${"1 Feb 2000"}       | ${"2000-02-01"}
    ${"01 FEB 2000"}      | ${"2000-02-01"}
    ${"12 Sept 2000"}     | ${"2000-09-12"}
    ${"01 February 2000"} | ${"2000-02-01"}
  `(
    "Standardised date text getter with $givenRawText",
    ({ expectedResult, givenRawText }) => {
      const result = getStandardisedDateText(givenRawText);
      expect(result).toBe(expectedResult);
    }
  );

  test("Standardised date text getter with invalid format", () => {
    const givenRawText = "given invalid raw text";

    let resultError;
    try {
      getStandardisedDateText(givenRawText);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Standardised date text getter with nonexistent month", () => {
    const givenRawText = "1 Invalidmonth 2000";

    let resultError;
    try {
      getStandardisedDateText(givenRawText);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Standardised date text getter with month abbreviation too short", () => {
    const givenRawText = "1 F 2000";

    let resultError;
    try {
      getStandardisedDateText(givenRawText);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });
});
