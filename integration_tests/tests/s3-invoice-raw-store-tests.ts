import {
  deleteObjectInS3,
  checkIfS3ObjectExists,
  getS3ItemsList,
  getS3Object,
  putObjectToS3,
  S3Object,
  BillingStandardised,
} from "../helpers/s3Helper";
import path from "path";
import fs from "fs";
import { resourcePrefix } from "../helpers/envHelper";
import { parseStrToJson, regexToRemoveSpecialChar, waitForTrue } from "../helpers/commonHelpers";

import {
  makeMockInvoicePDF,
  randomInvoice,
  writeInvoiceToS3,
} from "../helpers/mock-data/invoice";

const prefix = resourcePrefix();

describe("\n Happy path - Upload valid mock invoice pdf to the raw invoice pdf bucket test\n", () => {
  test("raw-invoice-textract-data and storage buckets should contain textracted and standardised data file for uploaded valid pdf file in raw-invoice-pdf bucket and should move the original raw invoice to successful folder in s3 raw-invoice-pdf bucket", async () => {
    const testStartTime = new Date();
    const invoice = randomInvoice();
    const storageBucket=`${prefix}-storage`
    const standardisedFolderPrefix='btm_billing_standardised'
    const { bucketName, path } = await makeMockInvoicePDF(writeInvoiceToS3)(
      invoice
    );
    const checkRawPdfFileExists = await checkIfS3ObjectExists({
      bucket: bucketName,
      key: path,
    });
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const checkTextractDataFileContainsStringFromOriginalPdf =
      async (): Promise<boolean> => {
        const result = await getS3ItemsList(
          `${prefix}-raw-invoice-textract-data`
        );
        if (result.Contents === undefined) {
          return false;
        }
        const s3ContentsFilteredByTestStartTime = result.Contents?.filter(
          (item) => {
            return (
              item.LastModified !== undefined &&
              item.LastModified >= testStartTime
            );
          }
        );
        console.log("Raw-invoice-Textract:", s3ContentsFilteredByTestStartTime);
        
        if (s3ContentsFilteredByTestStartTime.length === 0) {
          return false;
        }

        let fileContents: string | undefined = "";

        for (let i = 0; i < s3ContentsFilteredByTestStartTime.length; i++) {
          const key = String(s3ContentsFilteredByTestStartTime[i].Key);
          fileContents = await getS3Object({
            bucket: `${prefix}-raw-invoice-textract-data`,
            key,
          });
        }
        return fileContents?.includes(invoice.invoiceNumber) ?? false;
      };

    const textractFilteredObject = await waitForTrue(
      checkTextractDataFileContainsStringFromOriginalPdf,
      1000,
      30000
    );
    console.log(textractFilteredObject);
    expect(textractFilteredObject).toBeTruthy();

    const checkStandardisedFileContainsStringFromOriginalPdf =
      async (): Promise<boolean> => {
        const result = await getS3ItemsList(
          storageBucket,
          standardisedFolderPrefix
        );

        if (result.Contents === undefined) {
          return false;
        }

        const standardisedContentsFilteredByTestStartTime = result.Contents?.filter(
          (item) => {
            return (
              item.LastModified !== undefined &&
              item.LastModified >= testStartTime
            );
          }
        );
        console.log(
          "Standardised folder filtered contents:",
          standardisedContentsFilteredByTestStartTime
        );
        if (standardisedContentsFilteredByTestStartTime.length === 0) {
          return false;
        }
        let standardisedFileContents: string | undefined = "";

        for (let i = 0; i < standardisedContentsFilteredByTestStartTime.length; i++) {
          const key = String(standardisedContentsFilteredByTestStartTime[i].Key);
          standardisedFileContents = await getS3Object({
            bucket: storageBucket,
            key,
          });
        }
        if (standardisedFileContents === undefined) {
          return false;
        }
        const standardisedFileFormattedContents = JSON.stringify(
          standardisedFileContents
        );
        const formattedFileContents = regexToRemoveSpecialChar(
          standardisedFileFormattedContents
        );
        const standardisedFileContents2Json = parseStrToJson(
          formattedFileContents
        );
        const standardisedFileContents2JsonArray: BillingStandardised[] =
          JSON.parse("[" + String(standardisedFileContents2Json) + "]");
          
        for (let i = 0; i < standardisedFileContents2JsonArray.length; i++) {
          expect(
            standardisedFileContents2JsonArray[i].invoice_receipt_id
          ).toEqual(invoice.invoiceNumber);
          expect(
            standardisedFileContents2JsonArray[i].invoice_receipt_date
          ).toEqual(invoice.date.toISOString().slice(0, 10));
          expect(
            Number(standardisedFileContents2JsonArray[i].total).toFixed(2)
          ).toEqual(invoice.getTotal().toFixed(2));
        }
        return true;
      };

    const standardisedFilteredObject = await waitForTrue(
      checkStandardisedFileContainsStringFromOriginalPdf,
      1000,
      25000
    );
    console.log(standardisedFilteredObject);
    expect(standardisedFilteredObject).toBeTruthy();

    const isFileMovedToSuccessfulFolder = async (): Promise<boolean> => {
      const result = await getS3ItemsList(bucketName, "successful");
      if (result.Contents === undefined) {
        return false;
      }
      return result.Contents.some((t) => t.Key?.includes(path));
    };

    const originalFileExistsInSuccessfulFolder = await waitForTrue(
      isFileMovedToSuccessfulFolder,
      1000,
      21000
    );
    expect(originalFileExistsInSuccessfulFolder).toBeTruthy();
    await deleteObjectInS3({
      bucket: bucketName,
      key: `successful/${String(path)}`,
    });
    console.log("deleted the file from s3");
  });
});

describe("\n Unappy path - Upload invalid pdf to the raw invoice pdf bucket test\n", () => {
  const uniqueString = Math.random().toString(36).substring(2, 7);
  const rawInvoice: S3Object = {
    bucket: `${prefix}-raw-invoice-pdf`,
    key: `raw-Invoice-${uniqueString}-validFile.pdf`,
  };

  test("should move the original raw invoice to failed folder in s3 raw-invoice-pdf bucket upon uploading the invalid pdf file ", async () => {
    const file = "../payloads/invalidFiletoTestTextractFailure.pdf";
    const filename = path.join(__dirname, file);
    const fileStream = fs.createReadStream(filename);

    await putObjectToS3(rawInvoice, fileStream);

    const checkRawPdfFileExists = await checkIfS3ObjectExists(rawInvoice);
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const isFileMovedToFailedFolder = async (): Promise<boolean> => {
      const result = await getS3ItemsList(rawInvoice.bucket, "failed");
      if (result.Contents === undefined) {
        return false;
      }
      return result.Contents.some((items) =>
        items.Key?.includes(rawInvoice.key)
      );
    };
    const originalFileExistsInFailedFolder = await waitForTrue(
      isFileMovedToFailedFolder,
      1000,
      20000
    );
    expect(originalFileExistsInFailedFolder).toBeTruthy();
    await deleteObjectInS3({
      bucket: rawInvoice.bucket,
      key: "failed/" + rawInvoice.key,
    });
    console.log("deleted the file from s3");
  });
});

