import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";

export const getSubtotal = (
  fields: Textract.ExpenseField[]
): number | undefined => {
  const subtotal = getHighestConfidenceTextractValue(fields, "SUBTOTAL");

  if (subtotal === undefined) return undefined;

  try {
    return getNumberFromMoneyText(subtotal);
  } catch (error) {
    console.warn(error);
  }
};
