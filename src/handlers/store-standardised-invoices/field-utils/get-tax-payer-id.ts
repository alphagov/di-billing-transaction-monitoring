import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

export const getTaxPayerId = (
  fields: Textract.ExpenseField[]
): string | undefined =>
  getHighestConfidenceTextractValue(fields, "TAX_PAYER_ID");
