import {
  startQueryExecutionCommand,
  queryObject,
} from "../helpers/athenaHelper";
import {
  putObjectToS3,
  checkIfS3ObjectExists,
  s3GetObjectsToArray,
  S3Object,
} from "../helpers/s3Helper";
import { resourcePrefix } from "../helpers/envHelper";
import path from "path";
import fs from "fs";

const prefix = resourcePrefix();

describe("\nExecute athena query to retrieve invoice data and validate that it matches invoice files in storage s3 bucket\n", () => {
  const folderPrefix = "btm_billing_standardised";
  const testObject: S3Object = {
    bucket: `${prefix}-storage`,
    key: `${folderPrefix}/receipt.txt`,
  };
  const databaseName = `${prefix}-calculations`;

  beforeAll(async () => {
    // uploading file to s3 will be removed once BTM-276 implemented
    const file = "../payloads/receipt.txt";
    const filePath = path.join(__dirname, file);
    const fileStream = fs.createReadStream(filePath);
    await putObjectToS3(testObject, fileStream);
    const checkFileExists = await checkIfS3ObjectExists(testObject);
    expect(checkFileExists).toBeTruthy();
  });

  test("retrieved invoice details should matches with invoice data in s3 bucket ", async () => {
    const queryString =
      'SELECT * FROM "btm_billing_standardised" ORDER BY service_name ASC';
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryObj = await queryObject(queryId);
    const queryObjectsVal = Object.values(queryObj);
    const s3Array = await s3GetObjectsToArray(testObject.bucket, folderPrefix);
    const s3ObjectsVal = Object.values(s3Array);
    expect(s3ObjectsVal).toEqual(queryObjectsVal);
  });

  test("retrieved view query results should matches with s3", async () => {
    const s3Array = await s3GetObjectsToArray(testObject.bucket, folderPrefix);
    const s3Objects = s3Array.map(
      (element: {
        vendor_name: string;
        service_name: string;
        price: number;
      }) => {
        return {
          vendor_name: element.vendor_name,
          service_name: element.service_name,
          price: element.price,
        };
      }
    );

    const queryString =
      'SELECT * FROM "btm_billing_curated" ORDER BY service_name ASC';
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const strFromQuery = await queryObject(queryId);
    const queryObjects = strFromQuery.map(
      (element: {
        vendor_name: string;
        service_name: string;
        price: string;
      }) => {
        return {
          vendor_name: element.vendor_name,
          service_name: element.service_name,
          price: element.price,
        };
      }
    );
    expect(s3Objects).toEqual(queryObjects);
  });
});
