import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getInvoiceReceiptId } from "./get-invoice-receipt-id";

jest.mock("./get-highest-confidence-textract-value");
const mockedGetHighestConfidenceTextractValue =
  getHighestConfidenceTextractValue as jest.Mock;

describe("Invoice receipt ID getter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Invoice receipt ID getter with no Textract value", () => {
    mockedGetHighestConfidenceTextractValue.mockReturnValue(undefined);

    const givenFields = "given fields" as any;

    let resultError;
    try {
      getInvoiceReceiptId(givenFields);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "INVOICE_RECEIPT_ID"
    );
  });

  test("Invoice receipt ID getter with Textract value", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );

    const givenFields = "given fields" as any;

    const result = getInvoiceReceiptId(givenFields);

    expect(result).toBe(mockedTextractValue);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "INVOICE_RECEIPT_ID"
    );
  });
});
