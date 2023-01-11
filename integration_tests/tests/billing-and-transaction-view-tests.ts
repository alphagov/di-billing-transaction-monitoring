import { resourcePrefix } from "../helpers/envHelper";

import {
  deleteS3Events,
  generatePublishAndValidateEvents,
  TableNames,
  TimeStamps,
} from "../helpers/commonHelpers";
import {
  deleteDirectoryRecursiveInS3,
  putObjectToS3,
  checkIfS3ObjectExists,
  S3Object,
} from "../helpers/s3Helper";
import path from "path";
import fs from "fs";
import { EventName, ClientId } from "../payloads/snsEventPayload";
import { queryResponseFilterByVendorServiceNames } from "../helpers/queryHelper";

const prefix = resourcePrefix();
const bucketName = `${prefix}-storage`;

describe("\nUpload invoice to standardised folder and verify billing and transaction_curated view query results matches with expected data \n", () => {
  const folderPrefix = "btm_billing_standardised";
  const testObject: S3Object = {
    bucket: `${prefix}-storage`,
    key: `${folderPrefix}/receipt.txt`,
  };
  beforeAll(async () => {
    await deleteDirectoryRecursiveInS3(bucketName, "btm_transactions");
    // uploading file to s3 will be removed once BTM-276 implemented
    const file = "../payloads/receipt.txt";
    const filePath = path.join(__dirname, file);
    const fileStream = fs.createReadStream(filePath);
    await putObjectToS3(testObject, fileStream);
    const checkFileExists = await checkIfS3ObjectExists(testObject);
    expect(checkFileExists).toBeTruthy();
  });

  test.each`
         testCase                             | eventName                          | clientId     | eventTime                  | numberOfTestEvents | priceDiff   | qtyDiff | priceDifferencePercent | qtyDifferencePercent | billingPrice | billingQty | transactionPrice | transactionQty
   ${"BillingQty equals TransactionQty"}      | ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client1"} | ${TimeStamps.CURRENT_TIME} | ${"2"}             | ${"0.0000"} | ${"0"}  | ${"0.0000"}            | ${"0"}               | ${"6.6600"}  | ${"2"}     | ${"6.6600"}      | ${"2"}
   ${"BillingQty greater than TransactionQty"}| ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client1"} | ${TimeStamps.CURRENT_TIME} | ${"1"}             | ${"3.3300"} | ${"1"}  | ${"100.0000"}          | ${"100"}             | ${"6.6600"}  | ${"2"}     | ${"3.3300"}      | ${"1"}
   ${"BillingQty less than TransactionQty"}   | ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client1"} | ${TimeStamps.CURRENT_TIME} | ${"3"}             | ${"-3.3300"}| ${"-1"} | ${"-33.3333"}          | ${"-33"}             | ${"6.6600"}  | ${"2"}     | ${"9.9900"}      | ${"3"}
   ${"No TransactionQty but has BillingQty"}  | ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client1"} | ${TimeStamps.CURRENT_TIME} | ${undefined}       | ${"6.6600"} | ${"2"}  | ${undefined}           | ${undefined}         | ${"6.6600"}  | ${"2"}     | ${undefined}     | ${undefined}
  `(
    "results retrived from billing and transaction_curated view query should match with expected billingQuantity,priceDiff,qtyDiff,priceDifferencePercent,qtyDifferencePercent,billingPrice",
    async ({
      eventName,
      clientId,
      eventTime,
      numberOfTestEvents,
      priceDiff,
      qtyDiff,
      priceDifferencePercent,
      qtyDifferencePercent,
      billingPrice,
      billingQty,
      transactionPrice,
      transactionQty,
    }) => {
      await assertResultsWithTestData(
        eventName,
        clientId,
        eventTime,
        numberOfTestEvents,
        priceDiff,
        qtyDiff,
        priceDifferencePercent,
        qtyDifferencePercent,
        billingPrice,
        billingQty,
        transactionPrice,
        transactionQty
      );
    }
  );
});

describe("\n no inoice uploaded to standardised folder and verify billing and transaction_curated view query results matches with expected data    \n", () => {
  beforeAll(async () => {
    await deleteDirectoryRecursiveInS3(bucketName, "btm_billing_standardised");
    await deleteDirectoryRecursiveInS3(bucketName, "btm_transactions");
  });
  test.each`
      testCase                             | eventName                         | clientId     | eventTime                  | numberOfTestEvents | priceDiff    | qtyDiff | priceDifferencePercent | qtyDifferencePercent | billingPrice | billingQty   | transactionPrice | transactionQty
  ${"No BillingQty but has TransactionQty"}|${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client1"} | ${TimeStamps.CURRENT_TIME} | ${"1"}             | ${"-3.3300"} | ${"-1"} | ${"-100.0000"}         | ${"-100"}            | ${undefined} | ${undefined} | ${"3.3300"}      | ${"1"}
  `(
    "results retrived from billing and transaction_curated view query should match with expected billingQuantity,priceDiff,qtyDiff,priceDifferencePercent,qtyDifferencePercent,billingPrice",
    async ({
      eventName,
      clientId,
      eventTime,
      numberOfTestEvents,
      priceDiff,
      qtyDiff,
      priceDifferencePercent,
      qtyDifferencePercent,
      billingPrice,
      billingQty,
      transactionPrice,
      transactionQty,
    }) => {
      await assertResultsWithTestData(
        eventName,
        clientId,
        eventTime,
        numberOfTestEvents,
        priceDiff,
        qtyDiff,
        priceDifferencePercent,
        qtyDifferencePercent,
        billingPrice,
        billingQty,
        transactionPrice,
        transactionQty
      );
    }
  );
});

export const assertResultsWithTestData = async (
  eventName: EventName,
  clientId: ClientId,
  eventTime: number,
  numberOfTestEvents: number,
  priceDiff: string,
  qtyDiff: string,
  priceDifferencePercent: string,
  qtyDifferencePercent: string,
  billingPrice: string,
  billingQty: string,
  transactionPrice: string,
  transactionQty: string
): Promise<void> => {
  const eventIds = await generatePublishAndValidateEvents({
    numberOfTestEvents,
    eventName,
    clientId,
    eventTime,
  });
  const tableName = TableNames.BILLING_TRANSACTION_CURATED;
  const response: BillingTransactionCurated[] =
    await queryResponseFilterByVendorServiceNames({
      clientId,
      eventName,
      tableName,
    });
  await deleteS3Events(eventIds, eventTime);
  expect(response[0].price_difference).toEqual(priceDiff);
  expect(response[0].quantity_difference).toEqual(qtyDiff);
  expect(response[0].price_difference_percentage).toEqual(
    priceDifferencePercent
  );
  expect(response[0].quantity_difference_percentage).toEqual(
    qtyDifferencePercent
  );
  expect(response[0].billing_price).toEqual(billingPrice);
  expect(response[0].billing_quantity).toEqual(billingQty);
  expect(response[0].transaction_price).toEqual(transactionPrice);
  expect(response[0].transaction_quantity).toEqual(transactionQty);
};

interface BillingTransactionCurated {
  vendor_name: string;
  service_name: string;
  year: string;
  month: string;
  price_difference: number;
  quantity_difference: number;
  price_difference_percentage: number;
  quantity_difference_percentage: number;
  billing_price: number;
  billing_quantity: number;
  transaction_price: number;
  transaction_quantity: number;
}
