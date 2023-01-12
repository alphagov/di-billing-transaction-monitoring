import {
  startQueryExecutionCommand,
  queryObject,
} from "../helpers/athenaHelper";
import {
  checkIfS3ObjectExists,
  S3Object,
  s3GetObjectsToJson,
  deleteDirectoryRecursiveInS3,
  getS3ItemsList,
  BillingStandardised,
} from "../helpers/s3Helper";
import { resourcePrefix } from "../helpers/envHelper";

import {
  makeMockInvoicePDF,
  randomInvoice,
  writeInvoiceToS3,
} from "../helpers/mock-data/invoice";
import { waitForTrue } from "../helpers/commonHelpers";

const prefix = resourcePrefix();

describe("\nExecute athena query to retrieve invoice data and validate that it matches invoice files in storage s3 bucket\n", () => {
  const folderPrefix = "btm_billing_standardised";
  const storageBucket = `${prefix}-storage`;

  const databaseName = `${prefix}-invoices`;
  const invoice = randomInvoice();

  beforeAll(async () => {
    await deleteDirectoryRecursiveInS3(storageBucket, folderPrefix);
    const { bucketName, path } = await makeMockInvoicePDF(writeInvoiceToS3)(
      invoice
    );
    const checkRawPdfFileExists = await checkIfS3ObjectExists({
      bucket: bucketName,
      key: path,
    });
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const checkSizeOfStandardisedFolder = async (): Promise<boolean> => {
      const result = await getS3ItemsList(storageBucket, folderPrefix);
      if (result.Contents === undefined) {
        return false;
      }
      return result.Contents.length > 0;
    };

    const checkIfStandardisedFileExists = await waitForTrue(
      checkSizeOfStandardisedFolder,
      1000,
      20000
    );
    expect(checkIfStandardisedFileExists).toBeTruthy();
    console.log("file exists in standardised folder");
  });

  test("retrieved invoice details should matches with invoice data in s3 bucket ", async () => {
    const queryString =
      'SELECT * FROM "btm_billing_standardised" ORDER BY service_name ASC';
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryObj = await queryObject(queryId);
    const queryObjectsVal: BillingStandardised[] = Object.values(queryObj);
    const s3Json = await s3GetObjectsToJson(storageBucket, folderPrefix);
    const s3Array: BillingStandardised[] = JSON.parse(
      "[" + String(s3Json["0"]) + "]"
    );
    const s3ObjectsVal: BillingStandardised[] = Object.values(s3Array);
    for (let i = 0; i < s3ObjectsVal.length; i++) {
      expect(s3ObjectsVal[i].invoice_receipt_id).toEqual(
        queryObjectsVal[i].invoice_receipt_id
      );
      expect(s3ObjectsVal[i].vendor_name).toEqual(
        queryObjectsVal[i].vendor_name
      );
      expect(Number(s3ObjectsVal[i].total).toFixed(4)).toEqual(
        queryObjectsVal[i].total
      );
      expect(s3ObjectsVal[i].invoice_receipt_date).toEqual(
        queryObjectsVal[i].invoice_receipt_date
      );
      expect(Number(s3ObjectsVal[i].subtotal).toFixed(4)).toEqual(
        queryObjectsVal[i].subtotal
      );
      expect(s3ObjectsVal[i].due_date).toEqual(queryObjectsVal[i].due_date);
      expect(s3ObjectsVal[i].tax).toEqual(queryObjectsVal[i].tax);
      expect(s3ObjectsVal[i].tax_payer_id).toEqual(
        queryObjectsVal[i].tax_payer_id
      );
      expect(s3ObjectsVal[i].item_id).toEqual(queryObjectsVal[i].item_id);
      expect(s3ObjectsVal[i].item_description).toEqual(
        queryObjectsVal[i].item_description
      );
      expect(s3ObjectsVal[i].service_name).toEqual(
        queryObjectsVal[i].service_name
      );
      expect(Number(s3ObjectsVal[i].unit_price).toFixed(4)).toEqual(
        queryObjectsVal[i].unit_price
      );
      expect(s3ObjectsVal[i].quantity).toEqual(queryObjectsVal[i].quantity);
      expect(Number(s3ObjectsVal[i].price).toFixed(4)).toEqual(
        queryObjectsVal[i].price
      );
    }
  });

  test("price retrived from billing_curated view results should match with invoiced qty and price", async () => {
    let invoiceQty: number = 0;
    for (let i = 0; i < invoice.lineItems.length; i++) {
      const lineQty = invoice.lineItems[i].quantity;
      invoiceQty = invoiceQty + lineQty;
    }
    const queryString =
      'SELECT * FROM "btm_billing_curated" ORDER BY service_name ASC';
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const strFromQuery: BillingCurated[] = await queryObject(queryId);
    expect(strFromQuery[0].quantity).toEqual(invoiceQty.toString());
    expect(strFromQuery[0].price).toEqual(
      Number(invoice.getSubtotal()).toFixed(4)
    );
  });
});

interface BillingCurated {
  vendor_name: string;
  service_name: string;
  quantity: number;
  price: number;
  year: string;
  month: string;
}
