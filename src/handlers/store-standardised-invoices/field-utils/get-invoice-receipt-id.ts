import { Textract } from "aws-sdk";
import { getHighestConfidenceTextractValue } from "./get-highest-confidence-textract-value";

export const getInvoiceReceiptId = (
  fields: Textract.ExpenseField[]
): string => {
  const receiptId = getHighestConfidenceTextractValue(
    fields,
    "INVOICE_RECEIPT_ID"
  );

  if (receiptId === undefined) throw new Error("No invoice receipt ID found.");

  return receiptId;
};
