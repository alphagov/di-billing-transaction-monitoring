import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getTaxPayerId } from "./get-tax-payer-id";

jest.mock("./get-highest-confidence-textract-value");
const mockedGetHighestConfidenceTextractValue =
  getHighestConfidenceTextractValue as jest.Mock;

describe("Tax payer ID getter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Tax payer ID getter", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );

    const givenFields = "given fields" as any;

    const result = getTaxPayerId(givenFields);

    expect(result).toBe(mockedTextractValue);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "TAX_PAYER_ID"
    );
  });
});
