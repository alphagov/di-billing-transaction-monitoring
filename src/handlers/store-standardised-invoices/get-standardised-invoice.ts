import { Textract } from "aws-sdk";
import {
  getDueDate,
  getInvoiceReceiptDate,
  getInvoiceReceiptId,
  getItemDescription,
  getPrice,
  getQuantity,
  getSubtotal,
  getTax,
  getTaxPayerId,
  getTotal,
  getUnitPrice,
  getVendorName,
} from "./field-utils";

export interface StandardisedLineItem {
  invoice_receipt_id: string;
  vendor_name?: string;
  total: number;
  invoice_receipt_date: string;
  subtotal?: number;
  due_date?: string;
  tax?: number;
  tax_payer_id?: string;
  item_id?: number;
  item_description?: string;
  service_name?: string;
  unit_price?: number;
  quantity?: number;
  price?: number;
}

export const getStandardisedInvoice = (
  textractPages: Textract.ExpenseDocument[]
): StandardisedLineItem[] => {
  const summaryFields = getSummaryFields(textractPages);

  // To do: get line items another way, at least when not found this way (Jira: BTM-161)
  const lineItems = getLineItems(textractPages);

  const summary = {
    invoice_receipt_id: getInvoiceReceiptId(summaryFields),
    vendor_name: getVendorName(summaryFields),
    total: getTotal(summaryFields),
    invoice_receipt_date: getInvoiceReceiptDate(summaryFields),
    subtotal: getSubtotal(summaryFields),
    due_date: getDueDate(summaryFields),
    tax: getTax(summaryFields),
    tax_payer_id: getTaxPayerId(summaryFields),
  };

  const standardisedLineItems = lineItems.map((item) => {
    const itemFields = item.LineItemExpenseFields ?? [];

    return {
      ...summary,
      item_description: getItemDescription(itemFields),
      unit_price: getUnitPrice(itemFields),
      quantity: getQuantity(itemFields),
      price: getPrice(itemFields),
    };
  });

  return standardisedLineItems;
};

const getLineItems = (
  textractPages: Textract.ExpenseDocument[]
): Textract.LineItemFields[] =>
  textractPages
    .map((page) => page.LineItemGroups ?? [])
    .flat()
    .map((group) => group.LineItems ?? [])
    .flat();

const getSummaryFields = (
  textractPages: Textract.ExpenseDocument[]
): Textract.ExpenseField[] =>
  textractPages.map((page) => page.SummaryFields ?? []).flat();
