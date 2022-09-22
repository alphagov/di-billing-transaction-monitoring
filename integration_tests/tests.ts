// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-2",
  accessKeyId: process.env["AWS_ACCESS_KEY_ID"],
  secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"],
});
const sns = new AWS.SNS();
const snsTopicARN = process.env["SNSTOPICARN"];
const TABLE_NAME = process.env["TABLENAME"];
const sqs = new AWS.SQS();

describe.skip("E2E tests", () => {
  test("Publish sns message and expect message to reach dynamoDB ", async () => {
    const params = {
      Message: "Hi",
      TopicArn: snsTopicARN,
    };
    await sns.publish(params).promise();

    const dynamoParams = {
      TableName: TABLE_NAME,
    };
    const dynamo = new AWS.DynamoDB();
    const data = await dynamo.scan(dynamoParams).promise();
    expect(data.Items[0].message.S).toBe(params.Message);
  });
});

async function pollFromSQS() {
  console.log("Started SQS polling.");
  const params = {
    AttributeNames: ["SentTimestamp"],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: ["All"],
    QueueUrl: process.env["DLQ_QUEUEURL"],
    WaitTimeSeconds: 20,
  };

  const result = await sqs.receiveMessage(params).promise().catch();
  return result;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("E2E tests", () => {
  test("publish invalid message and check message is in DLQ", async () => {
    const params = {
      Message: "Testing DLQ",
      TopicArn: snsTopicARN,
    };
    await sns.publish(params).promise();
    await delay(60000);
    const result = await pollFromSQS();
    if (result && result.Messages && result.Messages.length > 0) {
      const body = JSON.parse(result.Messages[0].Body);
      expect(JSON.stringify(body)).toContain("Testing DLQ");
    }
    const logs = await cloudwatchLogsSearch();
    expect(JSON.stringify(logs)).toContain("ERROR");
    console.log(JSON.stringify(logs));
  });
});

async function cloudwatchLogsSearch() {
  const cloudwatchlogs = new AWS.CloudWatchLogs();
  const params = {
    logGroupName: process.env["LOG_GROUP_NAME"],
    logStreamName: process.env["LOG_STREAM_NAME"],
  };
  const response = await cloudwatchlogs.getLogEvents(params).promise().catch();
  return response;
}
