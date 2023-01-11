import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

// To do: get vendor name from more reliable source (Jira: BTM-159)
export const getVendorName = (
  fields: Textract.ExpenseField[]
): string | undefined =>
  getHighestConfidenceTextractValue(fields, "VENDOR_NAME");
