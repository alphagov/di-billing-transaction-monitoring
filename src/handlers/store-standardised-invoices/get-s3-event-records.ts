import { S3Event, S3EventRecord, SQSRecord } from "aws-lambda";

export const getS3EventRecords = (queueRecord: SQSRecord): S3EventRecord[] => {
  let bodyObject;
  try {
    bodyObject = JSON.parse(queueRecord.body);
  } catch {
    throw new Error("Record body not valid JSON.");
  }

  if (typeof bodyObject !== "object")
    throw new Error("Record body not object.");

  if (!isS3Event(bodyObject))
    throw new Error("Event record body not valid S3 event.");

  return bodyObject.Records;
};

const isS3Event = (object: any): object is S3Event =>
  Array.isArray(object.Records) &&
  object.Records.every(
    (record: any) =>
      typeof record?.s3?.bucket?.name === "string" &&
      typeof record?.s3?.object?.key === "string"
  );
