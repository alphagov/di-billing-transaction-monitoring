import {
  DeleteObjectCommand,
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  ServiceInputTypes,
  ServiceOutputTypes,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import type { Command, SmithyConfiguration } from "@aws-sdk/smithy-client";

const s3 = new S3Client({
  region: "eu-west-2",
  endpoint: process.env.LOCAL_ENDPOINT,
});

export async function deleteS3(bucket: string, key: string): Promise<void> {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await send(deleteCommand);
}

export async function fetchS3(
  bucket: string,
  key: string
): Promise<string | undefined> {
  const getCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const data = await send(getCommand);
  return await data.Body?.transformToString();
}

export async function moveS3(
  sourceBucket: string,
  sourceKey: string,
  destinationBucket: string,
  destinationKey: string
): Promise<void> {
  const copyCommand = new CopyObjectCommand({
    Bucket: destinationBucket,
    CopySource: `${sourceBucket}/${sourceKey}`,
    Key: destinationKey,
  });

  await send(copyCommand);

  await deleteS3(sourceBucket, sourceKey);
}

export const moveToFolderS3 = async (
  bucket: string,
  key: string,
  folder: string
): Promise<void> => await moveS3(bucket, key, bucket, `${folder}/${key}`);

export async function putS3(
  bucket: string,
  key: string,
  item: Object
): Promise<void> {
  const body = JSON.stringify(item);
  await putTextS3(bucket, key, body);
}

export async function putTextS3(
  bucket: string,
  key: string,
  body: string
): Promise<void> {
  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
  });

  await send(putCommand);
}

const send = async <T extends ServiceInputTypes, U extends ServiceOutputTypes>(
  command: Command<T, U, SmithyConfiguration<{}>>
): Promise<U> =>
  await s3
    .send(command)
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((err) => {
      console.log(err, err.stack);
      throw err;
    });
