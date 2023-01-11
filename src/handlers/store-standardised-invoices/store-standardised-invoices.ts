import { SQSRecord } from "aws-lambda";
import { putTextS3 } from "../../shared/utils";
import { fetchS3TextractData } from "./fetch-s3-textract-data";
import { getStandardisedInvoice } from "./get-standardised-invoice";
import { getS3EventRecords } from "./get-s3-event-records";

export async function storeStandardisedInvoices(
  queueRecord: SQSRecord,
  destinationBucket: string,
  destinationFolder: string
): Promise<void> {
  const storageRecords = getS3EventRecords(queueRecord);

  const promises = storageRecords.map(async (storageRecord) => {
    const sourceBucket = storageRecord.s3.bucket.name;
    const sourceFileName = storageRecord.s3.object.key;

    const textractData = await fetchS3TextractData(
      sourceBucket,
      sourceFileName
    );

    const standardisedInvoice = getStandardisedInvoice(textractData);

    // Convert line items to new-line-separated JSON object text, to work with Glue/Athena.
    const standardisedInvoiceText = standardisedInvoice
      .map((lineItem) => JSON.stringify(lineItem))
      .join("\n");

    // Since that text block is not valid JSON, use a file extension that is not `.json`.
    const destinationFileName = sourceFileName.replace(/\.json$/g, ".txt");

    await putTextS3(
      destinationBucket,
      `${destinationFolder}/${destinationFileName}`,
      standardisedInvoiceText
    );
  });

  await Promise.all(promises);
}
