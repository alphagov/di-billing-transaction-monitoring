import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import { storeStandardisedInvoices } from "./store-standardised-invoices";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const destinationBucket = process.env.DESTINATION_BUCKET;

  if (destinationBucket === undefined || destinationBucket.length === 0)
    throw new Error("Destination bucket not set.");

  const destinationFolder = process.env.DESTINATION_FOLDER;

  if (destinationFolder === undefined || destinationFolder.length === 0)
    throw new Error("Destination folder not set.");

  const response: Response = { batchItemFailures: [] };

  const promises = event.Records.map(async (record) => {
    try {
      await storeStandardisedInvoices(
        record,
        destinationBucket,
        destinationFolder
      );
    } catch (e) {
      console.error(e);
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};
