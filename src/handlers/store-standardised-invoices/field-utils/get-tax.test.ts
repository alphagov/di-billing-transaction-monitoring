import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";
import { getTax } from "./get-tax";

jest.mock("./get-highest-confidence-textract-value");
const mockedGetHighestConfidenceTextractValue =
  getHighestConfidenceTextractValue as jest.Mock;

jest.mock("./get-number-from-money-text");
const mockedGetNumberFromMoneyText = getNumberFromMoneyText as jest.Mock;

const oldConsoleWarn = console.warn;

describe("Tax getter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.warn = oldConsoleWarn;
  });

  test("Tax getter with no Textract value", () => {
    mockedGetHighestConfidenceTextractValue.mockReturnValue(undefined);

    const givenFields = "given fields" as any;

    const result = getTax(givenFields);

    expect(result).toBeUndefined();
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "TAX"
    );
    expect(mockedGetNumberFromMoneyText).not.toHaveBeenCalled();
  });

  test("Tax getter with Textract value", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );
    const mockedTaxNumber = "mocked tax number";
    mockedGetNumberFromMoneyText.mockReturnValue(mockedTaxNumber);

    const givenFields = "given fields" as any;

    const result = getTax(givenFields);

    expect(result).toBe(mockedTaxNumber);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "TAX"
    );
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledTimes(1);
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledWith(
      mockedTextractValue
    );
  });

  test("Tax getter with money parsing error", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );
    mockedGetNumberFromMoneyText.mockImplementation(() => {
      throw new Error("mocked error");
    });

    const givenFields = "given fields" as any;

    const result = getTax(givenFields);

    expect(result).toBeUndefined();
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "TAX"
    );
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledTimes(1);
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledWith(
      mockedTextractValue
    );
  });
});
