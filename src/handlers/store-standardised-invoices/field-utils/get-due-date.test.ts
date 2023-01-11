import { getDueDate } from "./get-due-date";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getStandardisedDateText } from "./get-standardised-date-text";

jest.mock("./get-highest-confidence-textract-value");
const mockedGetHighestConfidenceTextractValue =
  getHighestConfidenceTextractValue as jest.Mock;

jest.mock("./get-standardised-date-text");
const mockedGetStandardisedDateText = getStandardisedDateText as jest.Mock;

const oldConsoleWarn = console.warn;

describe("Due date getter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.warn = oldConsoleWarn;
  });

  test("Due date getter with no Textract value", () => {
    mockedGetHighestConfidenceTextractValue.mockReturnValue(undefined);

    const givenFields = "given fields" as any;

    const result = getDueDate(givenFields);

    expect(result).toBeUndefined();
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "DUE_DATE"
    );
    expect(mockedGetStandardisedDateText).not.toHaveBeenCalled();
  });

  test("Due date getter with Textract value", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );
    const mockedDateText = "mocked date text";
    mockedGetStandardisedDateText.mockReturnValue(mockedDateText);

    const givenFields = "given fields" as any;

    const result = getDueDate(givenFields);

    expect(result).toBe(mockedDateText);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "DUE_DATE"
    );
    expect(mockedGetStandardisedDateText).toHaveBeenCalledTimes(1);
    expect(mockedGetStandardisedDateText).toHaveBeenCalledWith(
      mockedTextractValue
    );
  });

  test("Due date getter with date parsing error", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );
    mockedGetStandardisedDateText.mockImplementation(() => {
      throw new Error("mocked error");
    });

    const givenFields = "given fields" as any;

    const result = getDueDate(givenFields);

    expect(result).toBeUndefined();
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "DUE_DATE"
    );
    expect(mockedGetStandardisedDateText).toHaveBeenCalledTimes(1);
    expect(mockedGetStandardisedDateText).toHaveBeenCalledWith(
      mockedTextractValue
    );
  });
});
