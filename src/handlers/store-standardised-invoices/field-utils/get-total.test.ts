import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";
import { getTotal } from "./get-total";

jest.mock("./get-highest-confidence-textract-value");
const mockedGetHighestConfidenceTextractValue =
  getHighestConfidenceTextractValue as jest.Mock;

jest.mock("./get-number-from-money-text");
const mockedGetNumberFromMoneyText = getNumberFromMoneyText as jest.Mock;

describe("Total getter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Total getter with no Textract value", () => {
    mockedGetHighestConfidenceTextractValue.mockReturnValue(undefined);

    const givenFields = "given fields" as any;

    let resultError;
    try {
      getTotal(givenFields);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "TOTAL"
    );
    expect(mockedGetNumberFromMoneyText).not.toHaveBeenCalled();
  });

  test("Total getter with Textract value", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );
    const mockedTotalNumber = "mocked total number";
    mockedGetNumberFromMoneyText.mockReturnValue(mockedTotalNumber);

    const givenFields = "given fields" as any;

    const result = getTotal(givenFields);

    expect(result).toBe(mockedTotalNumber);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "TOTAL"
    );
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledTimes(1);
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledWith(
      mockedTextractValue
    );
  });
});
