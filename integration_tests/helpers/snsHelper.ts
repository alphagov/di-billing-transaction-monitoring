import { snsClient } from "../clients/snsClient";
import {
  PublishCommand,
  PublishCommandOutput,
  PublishInput,
} from "@aws-sdk/client-sns";
import { resourcePrefix } from "./envHelper";

let snsParams: PublishInput;

async function snsParameters(snsValidEventPayload: any): Promise<{
  Message: string;
  TopicArn: string;
}> {
  const snsParams = {
    Message: JSON.stringify(snsValidEventPayload),
    TopicArn: `arn:aws:sns:eu-west-2:582874090139:${resourcePrefix()}-test-TxMA-topic`,
  };
  return snsParams;
}

async function publishSNS(payload: any): Promise<PublishCommandOutput> {
  snsParams = await snsParameters(payload);
  console.log("SNS PARAMETERS:", snsParams);
  const result = await snsClient.send(new PublishCommand(snsParams));
  console.log("***SNS event sent successfully****", result);
  return result;
}

export { publishSNS, snsParams };
