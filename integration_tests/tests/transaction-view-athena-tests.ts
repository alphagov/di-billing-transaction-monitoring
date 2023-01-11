import { resourcePrefix } from "../helpers/envHelper";
import {
  deleteS3Events,
  generatePublishAndValidateEvents,
  TableNames,
  TimeStamps,
} from "../helpers/commonHelpers";
import { publishSNS } from "../helpers/snsHelper";

import {
  ClientId,
  EventName,
  snsInvalidEventNamePayload,
} from "../payloads/snsEventPayload";
import { deleteDirectoryRecursiveInS3 } from "../helpers/s3Helper";
import { queryResponseFilterByVendorServiceNames } from "../helpers/queryHelper";

const prefix = resourcePrefix();
const bucketName = `${prefix}-storage`;

describe("\nExecute athena transaction curated query to retrive price \n", () => {
  beforeAll(async () => {
    await deleteDirectoryRecursiveInS3(bucketName, "btm_transactions");
  });

  test.each`
    eventName                          | clientId     | numberOfTestEvents | unitPrice | eventTime
    ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client1"} | ${2}               | ${1.23}   | ${TimeStamps.THIS_TIME_LAST_YEAR}
    ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client2"} | ${2}               | ${2.5}    | ${TimeStamps.CURRENT_TIME}
    ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client3"} | ${7}               | ${4.0}    | ${TimeStamps.CURRENT_TIME}
    ${"IPV_ADDRESS_CRI_END"}           | ${"client3"} | ${14}              | ${8.88}   | ${TimeStamps.CURRENT_TIME}
  `(
    "price retrived from transaction_curated athena view query should match with expected calculated price for $numberOfTestEvents",
    async ({
      eventName,
      clientId,
      numberOfTestEvents,
      unitPrice,
      eventTime,
    }: {
      clientId: ClientId;
      eventName: EventName;
      numberOfTestEvents: number;
      unitPrice: number;
      eventTime: number;
    }) => {
      const expectedPrice = (numberOfTestEvents * unitPrice).toFixed(4);
      const eventIds = await generatePublishAndValidateEvents({
        numberOfTestEvents,
        eventName,
        clientId,
        eventTime,
      });
      const tableName = TableNames.TRANSACTION_CURATED;
      const response: TransactionCuratedView[] =
        await queryResponseFilterByVendorServiceNames({
          clientId,
          eventName,
          tableName,
        });
      await deleteS3Events(eventIds, eventTime);
      expect(response[0].price).toEqual(expectedPrice);
    }
  );

  test("no results returned from transaction_curated athena view query when the event payload has invalid eventName", async () => {
    await publishSNS(snsInvalidEventNamePayload);
    const tableName = TableNames.TRANSACTION_CURATED;
    const queryRes = await queryResponseFilterByVendorServiceNames({
      clientId: snsInvalidEventNamePayload.client_id,
      eventName: snsInvalidEventNamePayload.event_name,
      tableName,
    });
    expect(queryRes.length).not.toBeGreaterThan(0);
  });
});

interface TransactionCuratedView {
  vendor_name: string;
  service_name: string;
  price: number;
  quantity: number;
  year: string;
  month: string;
}
