import { putObjectToS3, deleteObjectInS3 } from "../helpers/s3Helper";
import { checkGivenStringExistsInLogs } from "../helpers/cloudWatchHelper";
import path from "path";
import fs from "fs";

describe("\n Upload file to s3 bucket and validate extract lambda executed successfully \n", () => {
  const bucketNameMatchString = "di-btm-rawinvoicepdfbucket";
  const key = "payloads/sample.pdf";

  afterAll(async () => {
    const response=await deleteObjectInS3(bucketNameMatchString, key);
    expect(response.$metadata.httpStatusCode).toEqual(200)
    console.log("deleted the file from s3")
  });

  test("should extraction function triggered upon uploading file to s3 raw invoice pdf bucket", async () => {
    const file = "../payloads/sample.pdf";
    const filename = path.join(__dirname, file);
    const fileStream: any = fs.createReadStream(filename);
    const response=await putObjectToS3(bucketNameMatchString, key, fileStream);
    expect(response.$metadata.httpStatusCode).toEqual(200)
    console.log('successfully uploaded the file to s3')
    const givenStringExistsInLogs = await checkGivenStringExistsInLogs(
      "di-btm-ExtractFunction-",
      "ERROR"
    );
    expect(givenStringExistsInLogs).toBeFalsy();
  });
});
