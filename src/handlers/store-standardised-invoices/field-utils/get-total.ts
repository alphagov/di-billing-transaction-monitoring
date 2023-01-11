import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";
import { getNumberFromMoneyText } from "./get-number-from-money-text";

export const getTotal = (fields: Textract.ExpenseField[]): number => {
  const totalText = getHighestConfidenceTextractValue(fields, "TOTAL");
  if (totalText === undefined) throw new Error("No total found.");
  return getNumberFromMoneyText(totalText);
};
