import { Textract } from "aws-sdk";
import { fetchS3 } from "../../shared/utils";

export const fetchS3TextractData = async (
  bucket: string,
  key: string
): Promise<Textract.ExpenseDocument[]> => {
  const text = await fetchS3(bucket, key);

  if (text === undefined) throw new Error("No Textract data.");

  let documents;
  try {
    documents = JSON.parse(text);
  } catch {
    throw new Error("Textract data not valid JSON.");
  }

  if (!Array.isArray(documents)) throw new Error("Textract data not array.");

  for (const document of documents) {
    if (typeof document !== "object")
      throw new Error("Textract data not array of objects.");

    const { LineItemGroups: lineItemGroups, SummaryFields: summaryFields } =
      document;

    if (lineItemGroups !== undefined) {
      if (!Array.isArray(lineItemGroups))
        throw new Error("Textract line item groups property not array.");

      if (!lineItemGroups.every(isLineItemGroup))
        throw new Error("Invalid Textract line item group.");
    }

    if (summaryFields !== undefined) {
      if (!Array.isArray(summaryFields))
        throw new Error("Textract summary fields property not array.");

      if (!summaryFields.every(isExpenseField))
        throw new Error("Invalid Textract summary field.");
    }
  }

  return documents;
};

const isExpenseDetection = (x: any): x is Textract.ExpenseDetection =>
  typeof x === "object" &&
  (x.Text === undefined || typeof x.Text === "string") &&
  (x.Confidence === undefined || typeof x.Confidence === "number");

const isExpenseField = (x: any): x is Textract.ExpenseField =>
  typeof x === "object" &&
  (x.Type === undefined || isExpenseType(x.Type)) &&
  (x.ValueDetection === undefined || isExpenseDetection(x.ValueDetection));

const isExpenseType = (x: any): x is Textract.ExpenseType =>
  typeof x === "object" &&
  (x.Text === undefined || typeof x.Text === "string") &&
  (x.Confidence === undefined || typeof x.Confidence === "number");

const isLineItem = (x: any): x is Textract.LineItemFields =>
  x.LineItemExpenseFields === undefined ||
  (Array.isArray(x.LineItemExpenseFields) &&
    x.LineItemExpenseFields.every(isExpenseField));

const isLineItemGroup = (x: any): x is Textract.LineItemGroup =>
  x.LineItems === undefined ||
  (Array.isArray(x.LineItems) && x.LineItems.every(isLineItem));
