import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";
import { getUnitPrice } from "./get-unit-price";

jest.mock("./get-highest-confidence-textract-value");
const mockedGetHighestConfidenceTextractValue =
  getHighestConfidenceTextractValue as jest.Mock;

jest.mock("./get-number-from-money-text");
const mockedGetNumberFromMoneyText = getNumberFromMoneyText as jest.Mock;

const oldConsoleWarn = console.warn;

describe("Unit price getter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.warn = oldConsoleWarn;
  });

  test("Unit price getter with no Textract value", () => {
    mockedGetHighestConfidenceTextractValue.mockReturnValue(undefined);

    const givenFields = "given fields" as any;

    const result = getUnitPrice(givenFields);

    expect(result).toBeUndefined();
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "UNIT_PRICE"
    );
    expect(mockedGetNumberFromMoneyText).not.toHaveBeenCalled();
  });

  test("Unit price getter with Textract value", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );
    const mockedUnitPriceNumber = "mocked unit price number";
    mockedGetNumberFromMoneyText.mockReturnValue(mockedUnitPriceNumber);

    const givenFields = "given fields" as any;

    const result = getUnitPrice(givenFields);

    expect(result).toBe(mockedUnitPriceNumber);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "UNIT_PRICE"
    );
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledTimes(1);
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledWith(
      mockedTextractValue
    );
  });

  test("Unit price getter with money parsing error", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );
    mockedGetNumberFromMoneyText.mockImplementation(() => {
      throw new Error("mocked error");
    });

    const givenFields = "given fields" as any;

    const result = getUnitPrice(givenFields);

    expect(result).toBeUndefined();
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "UNIT_PRICE"
    );
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledTimes(1);
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledWith(
      mockedTextractValue
    );
  });
});
