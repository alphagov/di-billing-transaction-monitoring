import { Textract } from "aws-sdk";

export const getHighestConfidenceTextractValue = (
  fields: Textract.ExpenseField[],
  fieldType: string
): string | undefined => {
  const candidateFields = fields.filter(
    (field) =>
      field.Type?.Text === fieldType &&
      field.Type?.Confidence !== undefined &&
      field.ValueDetection?.Confidence !== undefined &&
      field.ValueDetection?.Text !== undefined
  );

  if (candidateFields.length === 0) return;

  let highestConfidenceFieldFound = candidateFields[0];
  for (const field of candidateFields.slice(1))
    if (getConfidence(field) > getConfidence(highestConfidenceFieldFound))
      highestConfidenceFieldFound = field;

  return highestConfidenceFieldFound.ValueDetection?.Text;
};

const getConfidence = (field: Textract.ExpenseField): number => {
  const typeConfidence = field.Type?.Confidence as number;
  const valueConfidence = field.ValueDetection?.Confidence as number;
  return typeConfidence * valueConfidence;
};
