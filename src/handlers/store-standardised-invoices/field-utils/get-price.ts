import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";

export const getPrice = (
  fields: Textract.ExpenseField[]
): number | undefined => {
  const price = getHighestConfidenceTextractValue(fields, "PRICE");

  if (price === undefined) return undefined;

  try {
    return getNumberFromMoneyText(price);
  } catch (error) {
    console.warn(error);
  }
};
