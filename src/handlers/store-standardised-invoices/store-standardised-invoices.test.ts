import { SQSRecord } from "aws-lambda";
import { putTextS3 } from "../../shared/utils";
import { fetchS3TextractData } from "./fetch-s3-textract-data";
import { getS3EventRecords } from "./get-s3-event-records";
import { getStandardisedInvoice } from "./get-standardised-invoice";
import { storeStandardisedInvoices } from "./store-standardised-invoices";

jest.mock("../../shared/utils");
const mockedPutTextS3 = putTextS3 as jest.Mock;

jest.mock("./fetch-s3-textract-data");
const mockedFetchS3TextractData = fetchS3TextractData as jest.Mock;

jest.mock("./get-s3-event-records");
const mockedGetS3EventRecords = getS3EventRecords as jest.Mock;

jest.mock("./get-standardised-invoice");
const mockedGetStandardisedInvoice = getStandardisedInvoice as jest.Mock;

describe("Standardised invoice storer", () => {
  let mockedStandardisedInvoice: any[];
  let mockedS3EventRecord1: any;
  let mockedS3EventRecord1ObjectKeyWithoutFileExtension: string;
  let mockedS3EventRecord2: any;
  let mockedS3EventRecord2ObjectKeyWithoutFileExtension: string;
  let mockedS3EventRecords: any;
  let mockedTextractData: any;
  let givenDestinationBucket: string;
  let givenDestinationFolder: string;
  let givenQueueRecord: SQSRecord;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedStandardisedInvoice = [
      "mocked Textract line item 1",
      "mocked Textract line item 2",
    ];

    mockedGetStandardisedInvoice.mockReturnValue(mockedStandardisedInvoice);

    mockedTextractData = "mocked Textract data";
    mockedFetchS3TextractData.mockReturnValue(mockedTextractData);

    mockedS3EventRecord1ObjectKeyWithoutFileExtension =
      "mocked-s3-event-record-1-s3-object-key";

    mockedS3EventRecord1 = {
      s3: {
        bucket: {
          name: "mocked S3 event record 1 S3 bucket name",
        },
        object: {
          key: `${mockedS3EventRecord1ObjectKeyWithoutFileExtension}.json`,
        },
      },
    };

    mockedS3EventRecord2ObjectKeyWithoutFileExtension =
      "mocked-s3-event-record-2-s3-object-key";

    mockedS3EventRecord2 = {
      s3: {
        bucket: {
          name: "mocked S3 event record 2 S3 bucket name",
        },
        object: {
          key: `${mockedS3EventRecord2ObjectKeyWithoutFileExtension}.json`,
        },
      },
    };

    mockedS3EventRecords = [mockedS3EventRecord1, mockedS3EventRecord2];
    mockedGetS3EventRecords.mockReturnValue(mockedS3EventRecords);

    givenDestinationBucket = "given destination bucket";
    givenDestinationFolder = "given destination folder";
    givenQueueRecord = "given record" as any;
  });

  test("Standardised invoice storer with invalid queue record", async () => {
    const mockedError = new Error("mocked error");
    mockedGetS3EventRecords.mockImplementation(() => {
      throw mockedError;
    });

    let resultError;
    try {
      await storeStandardisedInvoices(
        givenQueueRecord,
        givenDestinationBucket,
        givenDestinationFolder
      );
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBe(mockedError);
    expect(mockedGetS3EventRecords).toHaveBeenCalledTimes(1);
    expect(mockedGetS3EventRecords).toHaveBeenCalledWith(givenQueueRecord);
    expect(mockedFetchS3TextractData).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoice).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
  });

  test("Standardised invoice storer with no storage records", async () => {
    mockedGetS3EventRecords.mockReturnValue([]);

    await storeStandardisedInvoices(
      givenQueueRecord,
      givenDestinationBucket,
      givenDestinationFolder
    );

    expect(mockedFetchS3TextractData).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoice).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
  });

  test("Standardised invoice storer with Textract fetch error", async () => {
    const mockedError = new Error("mocked error");
    mockedFetchS3TextractData.mockImplementation(() => {
      throw mockedError;
    });

    let resultError;
    try {
      await storeStandardisedInvoices(
        givenQueueRecord,
        givenDestinationBucket,
        givenDestinationFolder
      );
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBe(mockedError);
    expect(mockedFetchS3TextractData).toHaveBeenCalledTimes(2);
    expect(mockedFetchS3TextractData).toHaveBeenCalledWith(
      mockedS3EventRecord1.s3.bucket.name,
      mockedS3EventRecord1.s3.object.key
    );
    expect(mockedFetchS3TextractData).toHaveBeenCalledWith(
      mockedS3EventRecord2.s3.bucket.name,
      mockedS3EventRecord2.s3.object.key
    );
    expect(mockedGetStandardisedInvoice).not.toHaveBeenCalled();
    expect(mockedPutTextS3).not.toHaveBeenCalled();
  });

  test("Standardised invoice storer with invoice validation failure", async () => {
    const mockedError = new Error("mocked error");
    mockedGetStandardisedInvoice.mockImplementation(() => {
      throw mockedError;
    });

    let resultError;
    try {
      await storeStandardisedInvoices(
        givenQueueRecord,
        givenDestinationBucket,
        givenDestinationFolder
      );
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBe(mockedError);
    expect(mockedGetStandardisedInvoice).toHaveBeenCalledTimes(2);
    expect(mockedGetStandardisedInvoice).toHaveBeenCalledWith(
      mockedTextractData
    );
    expect(mockedPutTextS3).not.toHaveBeenCalled();
  });

  test("Standardised invoice storer with S3 storing failure", async () => {
    const mockedError = new Error("mocked error");
    mockedPutTextS3.mockRejectedValue(mockedError);

    let resultError;
    try {
      await storeStandardisedInvoices(
        givenQueueRecord,
        givenDestinationBucket,
        givenDestinationFolder
      );
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBe(mockedError);
    expect(mockedPutTextS3).toHaveBeenCalledTimes(2);
    const expectedStandardisedInvoiceText =
      '"mocked Textract line item 1"\n"mocked Textract line item 2"';
    expect(mockedPutTextS3).toHaveBeenCalledWith(
      givenDestinationBucket,
      `${givenDestinationFolder}/${mockedS3EventRecord1ObjectKeyWithoutFileExtension}.txt`,
      expectedStandardisedInvoiceText
    );
    expect(mockedPutTextS3).toHaveBeenCalledWith(
      givenDestinationBucket,
      `${givenDestinationFolder}/${mockedS3EventRecord2ObjectKeyWithoutFileExtension}.txt`,
      expectedStandardisedInvoiceText
    );
  });

  test("Standardised invoice storer without error", async () => {
    const result = await storeStandardisedInvoices(
      givenQueueRecord,
      givenDestinationBucket,
      givenDestinationFolder
    );

    expect(result).toBeUndefined();
  });
});
