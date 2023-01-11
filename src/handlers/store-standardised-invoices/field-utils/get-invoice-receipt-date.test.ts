import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getInvoiceReceiptDate } from "./get-invoice-receipt-date";
import { getStandardisedDateText } from "./get-standardised-date-text";

jest.mock("./get-highest-confidence-textract-value");
const mockedGetHighestConfidenceTextractValue =
  getHighestConfidenceTextractValue as jest.Mock;

jest.mock("./get-standardised-date-text");
const mockedGetStandardisedDateText = getStandardisedDateText as jest.Mock;

describe("Invoice receipt date getter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Invoice receipt date getter with no Textract value", () => {
    mockedGetHighestConfidenceTextractValue.mockReturnValue(undefined);

    const givenFields = "given fields" as any;

    let resultError;
    try {
      getInvoiceReceiptDate(givenFields);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "INVOICE_RECEIPT_DATE"
    );
    expect(mockedGetStandardisedDateText).not.toHaveBeenCalled();
  });

  test("Invoice receipt date getter with Textract value", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );
    const mockedDateText = "mocked date text";
    mockedGetStandardisedDateText.mockReturnValue(mockedDateText);

    const givenFields = "given fields" as any;

    const result = getInvoiceReceiptDate(givenFields);

    expect(result).toBe(mockedDateText);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "INVOICE_RECEIPT_DATE"
    );
    expect(mockedGetStandardisedDateText).toHaveBeenCalledTimes(1);
    expect(mockedGetStandardisedDateText).toHaveBeenCalledWith(
      mockedTextractValue
    );
  });
});
