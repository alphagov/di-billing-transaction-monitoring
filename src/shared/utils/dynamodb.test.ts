import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { putDDB } from "./dynamodb";

const dynamoDBDocumentMock = mockClient(DynamoDBDocumentClient);

const oldConsoleLog = console.log;
const tableName = "A Table";
const item = { id: 1234 };

beforeEach(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = oldConsoleLog;
});

test("log message when error happens", async () => {
  dynamoDBDocumentMock.on(PutCommand).rejects("An error");

  await expect(putDDB(tableName, item)).rejects.toMatchObject({
    message: "An error",
  });
  expect(dynamoDBDocumentMock.calls()[0].firstArg.input).toEqual({
    TableName: tableName,
    Item: item,
  });
});

test("Handle successful put", async () => {
  dynamoDBDocumentMock.on(PutCommand).resolves({});

  await putDDB(tableName, item);

  expect(dynamoDBDocumentMock.calls()[0].firstArg.input).toEqual({
    TableName: tableName,
    Item: item,
  });
});