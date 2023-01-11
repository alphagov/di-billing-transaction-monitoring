import { getQuantity } from "./get-quantity";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

jest.mock("./get-highest-confidence-textract-value");
const mockedGetHighestConfidenceTextractValue =
  getHighestConfidenceTextractValue as jest.Mock;

describe("Quantity getter", () => {
  let givenFields: any;

  beforeEach(() => {
    jest.resetAllMocks();
    givenFields = "given fields";
  });

  test.each`
    mockedTextractValue | expectedResult
    ${undefined}        | ${undefined}
    ${"10000"}          | ${10_000}
    ${"10,000"}         | ${10_000}
    ${"10.000"}         | ${10_000}
    ${"10000.00"}       | ${10_000}
    ${"10,000.00"}      | ${10_000}
    ${"10000,00"}       | ${10_000}
    ${"10.000,00"}      | ${10_000}
  `(
    "Quantity getter with value $mockedTextractValue",
    ({ expectedResult, mockedTextractValue }) => {
      mockedGetHighestConfidenceTextractValue.mockReturnValue(
        mockedTextractValue
      );

      const result = getQuantity(givenFields);

      expect(result).toBe(expectedResult);
      expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
      expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
        givenFields,
        "QUANTITY"
      );
    }
  );
});
