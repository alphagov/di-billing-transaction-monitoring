import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

export const getQuantity = (
  fields: Textract.ExpenseField[]
): number | undefined => {
  const quantity = getHighestConfidenceTextractValue(fields, "QUANTITY")
    ?.replace(/[.,]00?$/g, "")
    .replace(/[.,]/g, "");

  return quantity === undefined ? undefined : Number(quantity);
};
