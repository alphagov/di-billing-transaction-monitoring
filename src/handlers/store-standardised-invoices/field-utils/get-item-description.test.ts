import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getItemDescription } from "./get-item-description";

jest.mock("./get-highest-confidence-textract-value");
const mockedGetHighestConfidenceTextractValue =
  getHighestConfidenceTextractValue as jest.Mock;

describe("Item description getter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Item description getter", () => {
    const mockedTextractValue = "mocked Textract value";
    mockedGetHighestConfidenceTextractValue.mockReturnValue(
      mockedTextractValue
    );

    const givenFields = "given fields" as any;

    const result = getItemDescription(givenFields);

    expect(result).toBe(mockedTextractValue);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledTimes(1);
    expect(getHighestConfidenceTextractValue).toHaveBeenCalledWith(
      givenFields,
      "ITEM"
    );
  });
});
