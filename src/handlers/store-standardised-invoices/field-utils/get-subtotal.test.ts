import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";
import { getSubtotal } from "./get-subtotal";

jest.mock("./get-highest-confidence-textract-value");
const mockedGetHighestConfidenceTextractValue =
  getHighestConfidenceTextractValue as jest.Mock;

jest.mock("./get-number-from-money-text");
const mockedGetNumberFromMoneyText = getNumberFromMoneyText as jest.Mock;

const oldConsoleWarn = console.warn;

describe("Subtotal getter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.warn = oldConsoleWarn;
  });

  test("Subtotal getter with no Textract value", () => {
    mockedGetHighestConfidenceTextractValue.mockReturnValue(undefined);

    const givenFields = "given fields" as any;

    const result = getSubtotal(givenFields);

    expect(result).toBeUndefined();
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "SUBTOTAL"
    );
    expect(mockedGetNumberFromMoneyText).not.toHaveBeenCalled();
  });

  test("Subtotal getter with Textract value", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );
    const mockedSubtotalNumber = "mocked subtotal number";
    mockedGetNumberFromMoneyText.mockReturnValue(mockedSubtotalNumber);

    const givenFields = "given fields" as any;

    const result = getSubtotal(givenFields);

    expect(result).toBe(mockedSubtotalNumber);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "SUBTOTAL"
    );
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledTimes(1);
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledWith(
      mockedTextractValue
    );
  });

  test("Subtotal getter with money parsing error", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );
    mockedGetNumberFromMoneyText.mockImplementation(() => {
      throw new Error("mocked error");
    });

    const givenFields = "given fields" as any;

    const result = getSubtotal(givenFields);

    expect(result).toBeUndefined();
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "SUBTOTAL"
    );
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledTimes(1);
    expect(mockedGetNumberFromMoneyText).toHaveBeenCalledWith(
      mockedTextractValue
    );
  });
});
