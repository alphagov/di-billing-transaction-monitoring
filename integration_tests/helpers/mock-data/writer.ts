import { writeFile } from "fs";
import { resourcePrefix } from "../envHelper";
import { putObjectToS3 } from "../s3Helper";

export const writeInvoiceToS3 = async (
  file: ArrayBuffer
): Promise<{ bucketName: string; path: string }> => {
  const bucketName = `${resourcePrefix()}-raw-invoice-pdf`;
  const path = `raw-Invoice-${Math.random()
    .toString(36)
    .substring(2, 7)}-validFile.pdf`;
  await putObjectToS3(bucketName, path, file);
  return {
    bucketName,
    path,
  };
};

// eslint-disable-next-line @typescript-eslint/promise-function-async
export const writeInvoiceToDisk = (file: ArrayBuffer): Promise<void> =>
  new Promise((resolve, reject) => {
    writeFile("./pdf.pdf", new DataView(file), (err) => {
      if (err !== null) return reject(err);
      resolve();
    });
  });
