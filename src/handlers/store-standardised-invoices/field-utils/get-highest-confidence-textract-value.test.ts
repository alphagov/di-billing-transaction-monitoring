import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

const mockField = (
  type?: string,
  value?: string,
  confidence?: number
): Textract.ExpenseField => ({
  Type: {
    Text: type,
    Confidence:
      confidence === undefined ? undefined : Math.sqrt(confidence / 100) * 100,
  },
  ValueDetection: {
    Text: value,
    Confidence:
      confidence === undefined ? undefined : Math.sqrt(confidence / 100) * 100,
  },
});

describe("Highest confidence Textract value getter", () => {
  let givenType: string;

  beforeEach(() => {
    givenType = "given type";
  });

  test("Highest confidence Textract value getter with no fields", () => {
    const givenFields: Textract.ExpenseField[] = [];
    const result = getHighestConfidenceTextractValue(givenFields, givenType);
    expect(result).toBeUndefined();
  });

  test("Highest confidence Textract value getter with empty fields", () => {
    const givenFields: Textract.ExpenseField[] = [{}, {}];
    const result = getHighestConfidenceTextractValue(givenFields, givenType);
    expect(result).toBeUndefined();
  });

  test("Highest confidence Textract value getter with field without type", () => {
    const givenFields: Textract.ExpenseField[] = [
      mockField(undefined, "given value", 100),
    ];

    const result = getHighestConfidenceTextractValue(givenFields, givenType);

    expect(result).toBeUndefined();
  });

  test("Highest confidence Textract value getter with field without value", () => {
    const givenFields: Textract.ExpenseField[] = [
      mockField(givenType, undefined, 100),
    ];

    const result = getHighestConfidenceTextractValue(givenFields, givenType);

    expect(result).toBeUndefined();
  });

  test("Highest confidence Textract value getter with field without confidence", () => {
    const givenFields: Textract.ExpenseField[] = [
      mockField(givenType, "given value", undefined),
    ];

    const result = getHighestConfidenceTextractValue(givenFields, givenType);

    expect(result).toBeUndefined();
  });

  test("Highest confidence Textract value getter with field no matching field", () => {
    const givenFields: Textract.ExpenseField[] = [
      mockField("not given type", "given value", 100),
    ];

    const result = getHighestConfidenceTextractValue(givenFields, givenType);

    expect(result).toBeUndefined();
  });

  test("Highest confidence Textract value getter with one matching field", () => {
    const givenFields: Textract.ExpenseField[] = [
      mockField(givenType, "given value", 100),
    ];

    const result = getHighestConfidenceTextractValue(givenFields, givenType);

    expect(result).toBe("given value");
  });

  test("Highest confidence Textract value getter multiple matching fields", () => {
    const givenFields: Textract.ExpenseField[] = [
      mockField(givenType, "given lower confidence value 1", 98),
      mockField(givenType, "given lower confidence value 2", 0),
      mockField(givenType, "given highest confidence value", 99),
      mockField(givenType, "given lower confidence value 3", 98),
    ];

    const result = getHighestConfidenceTextractValue(givenFields, givenType);

    expect(result).toBe("given highest confidence value");
  });
});
