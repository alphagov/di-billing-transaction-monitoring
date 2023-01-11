import { getNumberFromMoneyText } from "./get-number-from-money-text";

describe("Number from money text getter", () => {
  test.each`
    givenText        | expectedResult
    ${"0.00"}        | ${0}
    ${"10000.00"}    | ${10_000}
    ${"10,000.00"}   | ${10_000}
    ${"£0.00"}       | ${0}
    ${"£10000.00"}   | ${10_000}
    ${"£10,000.00"}  | ${10_000}
    ${"£ 0.00"}      | ${0}
    ${"£ 10000.00"}  | ${10_000}
    ${"£ 10,000.00"} | ${10_000}
  `(
    "Number from money text getter with $givenText",
    ({ expectedResult, givenText }) => {
      const result = getNumberFromMoneyText(givenText);
      expect(result).toBe(expectedResult);
    }
  );

  test("Number from money text getter with invalid money text", () => {
    const givenText = "given invalid text";

    let resultError;
    try {
      getNumberFromMoneyText(givenText);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });
});
