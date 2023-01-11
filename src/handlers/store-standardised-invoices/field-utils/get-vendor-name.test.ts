import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getVendorName } from "./get-vendor-name";

jest.mock("./get-highest-confidence-textract-value");
const mockedGetHighestConfidenceTextractValue =
  getHighestConfidenceTextractValue as jest.Mock;

describe("Vendor name getter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Vendor name getter", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );

    const givenFields = "given fields" as any;

    const result = getVendorName(givenFields);

    expect(result).toBe(mockedTextractValue);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "VENDOR_NAME"
    );
  });
});
