import { SQSEvent, SQSRecord } from "aws-lambda";
import { handler } from "./handler";
import { storeStandardisedInvoices } from "./store-standardised-invoices";

jest.mock("./store-standardised-invoices");
const mockedStoreStandardisedInvoices =
  storeStandardisedInvoices as jest.MockedFn<typeof storeStandardisedInvoices>;

describe("Store Standardised Invoices handler tests", () => {
  const OLD_ENV = process.env;
  const oldConsoleError = console.error;
  let givenEvent: SQSEvent;

  beforeEach(() => {
    jest.resetAllMocks();

    console.error = jest.fn();

    process.env = {
      ...OLD_ENV,
      DESTINATION_BUCKET: "given destination bucket",
      DESTINATION_FOLDER: "given destination folder",
    };

    givenEvent = { Records: [] };
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error = oldConsoleError;
  });

  test("Store Standardised Invoices handler with no destination bucket set", async () => {
    delete process.env.DESTINATION_BUCKET;

    let resultError;
    try {
      await handler(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Store Standardised Invoices handler with no destination folder set", async () => {
    delete process.env.DESTINATION_FOLDER;

    let resultError;
    try {
      await handler(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Store Standardised Invoices handler with two failing records", async () => {
    mockedStoreStandardisedInvoices.mockRejectedValue(undefined);

    const givenRecord1 = {
      messageId: "given record 1 message ID",
    } as unknown as SQSRecord;
    const givenRecord2 = {
      messageId: "given record 2 message ID",
    } as unknown as SQSRecord;
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedStoreStandardisedInvoices).toHaveBeenCalledTimes(2);
    expect(mockedStoreStandardisedInvoices).toHaveBeenCalledWith(
      givenRecord1,
      process.env.DESTINATION_BUCKET,
      process.env.DESTINATION_FOLDER
    );
    expect(mockedStoreStandardisedInvoices).toHaveBeenCalledWith(
      givenRecord2,
      process.env.DESTINATION_BUCKET,
      process.env.DESTINATION_FOLDER
    );
    expect(result).toEqual({
      batchItemFailures: [
        { itemIdentifier: "given record 1 message ID" },
        { itemIdentifier: "given record 2 message ID" },
      ],
    });
  });

  test("Store Standardised Invoices handler with one failing and one passing record", async () => {
    mockedStoreStandardisedInvoices.mockRejectedValueOnce(undefined);

    const givenRecord1 = {
      messageId: "given record 1 message ID",
    } as unknown as SQSRecord;
    const givenRecord2 = {
      messageId: "given record 2 message ID",
    } as unknown as SQSRecord;
    givenEvent.Records.push(givenRecord1, givenRecord2);

    const result = await handler(givenEvent);

    expect(mockedStoreStandardisedInvoices).toHaveBeenCalledTimes(2);
    expect(mockedStoreStandardisedInvoices).toHaveBeenCalledWith(
      givenRecord1,
      process.env.DESTINATION_BUCKET,
      process.env.DESTINATION_FOLDER
    );
    expect(mockedStoreStandardisedInvoices).toHaveBeenCalledWith(
      givenRecord2,
      process.env.DESTINATION_BUCKET,
      process.env.DESTINATION_FOLDER
    );
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given record 1 message ID" }],
    });
  });
});
