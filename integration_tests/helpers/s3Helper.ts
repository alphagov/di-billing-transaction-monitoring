import { s3Client } from "../clients/s3Client";
import {
  CopyObjectCommand,
  CopyObjectCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { parseStrToJson, regexToRemoveSpecialChar } from "./commonHelpers";

interface S3Object {
  bucket: string;
  key: string;
}

const getS3ItemsList = async (
  bucketName: string,
  prefix?: string
): Promise<ListObjectsCommandOutput> => {
  const bucketParams = {
    Bucket: bucketName,
    Prefix: prefix,
  };
  const data = await s3Client.send(new ListObjectsCommand(bucketParams));
  return data;
};

const getS3Object = async (object: S3Object): Promise<string | undefined> => {
  const bucketParams = {
    Bucket: object.bucket,
    Key: object.key,
  };
  const getObjectResult = await s3Client.send(
    new GetObjectCommand(bucketParams)
  );
  return await getObjectResult.Body?.transformToString();
};

const putObjectToS3 = async (
  object: S3Object,
  body: PutObjectCommandInput["Body"]
): Promise<PutObjectCommandOutput> => {
  const bucketParams = {
    Bucket: object.bucket,
    Key: object.key,
    Body: body,
  };
  return await s3Client.send(new PutObjectCommand(bucketParams));
};

const deleteObjectInS3 = async (
  object: S3Object
): Promise<DeleteObjectCommandOutput> => {
  const bucketParams = {
    Bucket: object.bucket,
    Key: object.key,
  };
  return await s3Client.send(new DeleteObjectCommand(bucketParams));
};

const deleteDirectoryRecursiveInS3 = async (
  bucketName: string,
  prefix?: string
): Promise<DeleteObjectCommandOutput[]> => {
  const result = await getS3ItemsList(bucketName, prefix);
  if (result.Contents == null) {
    throw new Error("No files found to delete");
  }

  return await Promise.all(
    result.Contents.map(
      async (item) =>
        await deleteObjectInS3({ bucket: bucketName, key: item.Key ?? "" })
    )
  );
};

const copyObject = async (
  source: S3Object,
  destination: S3Object
): Promise<CopyObjectCommandOutput> => {
  const bucketParams = {
    Bucket: destination.bucket,
    CopySource: `${source.bucket}/${source.key}`,
    Key: destination.key,
  };

  console.log(bucketParams);
  return await s3Client.send(new CopyObjectCommand(bucketParams));
};

const checkIfS3ObjectExists = async (object: S3Object): Promise<boolean> => {
  const bucketParams = {
    Bucket: object.bucket,
    Key: object.key,
  };
  try {
    const data: HeadObjectCommandOutput = await s3Client.send(
      new HeadObjectCommand(bucketParams)
    );
    return data.$metadata.httpStatusCode === 200;
  } catch (err) {
    if (err instanceof Error) console.log(err.name);
    return false;
  }
};

const getAllObjectsFromS3 = async (
  bucketName: string,
  prefix: string
): Promise<string[]> => {
  const content = [];
  const response = await getS3ItemsList(bucketName, prefix);
  if (response.Contents === undefined) {
    throw new Error("Invalid results");
  } else {
    for (const currentValue of response.Contents) {
      if (currentValue.Size === null || currentValue.Key === undefined) {
        continue;
      }
      const res = await getS3Object({
        bucket: bucketName,
        key: currentValue.Key,
      });
      if (res !== undefined) {
        content.push(res);
      }
    }
  }

  return content;
};

export interface BillingStandardised {
  invoice_receipt_id: string;
  vendor_name: string;
  total: number;
  invoice_receipt_date: string;
  subtotal: number;
  due_date: string;
  tax: number;
  tax_payer_id: string;
  item_id: number;
  item_description: string;
  service_name: string;
  unit_price: number;
  quantity: number;
  price: number;
}

 const s3GetObjectsToJson = async (
  bucketName: string,
  folderPrefix: string
): Promise<BillingStandardised[]> => {
  const s3Response = await getAllObjectsFromS3(bucketName, folderPrefix);
  const convertS3Repsonse2Str = JSON.stringify(s3Response);
  const formatS3Str = regexToRemoveSpecialChar(convertS3Repsonse2Str)
  return parseStrToJson(formatS3Str)
};

export {
  S3Object,
  getS3ItemsList,
  getS3Object,
  putObjectToS3,
  deleteObjectInS3,
  copyObject,
  deleteDirectoryRecursiveInS3,
  checkIfS3ObjectExists,
  getAllObjectsFromS3,
  s3GetObjectsToJson,
};
