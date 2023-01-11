import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

export const getItemDescription = (
  fields: Textract.ExpenseField[]
): string | undefined => getHighestConfidenceTextractValue(fields, "ITEM");
