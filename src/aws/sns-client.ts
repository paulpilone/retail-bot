import { 
  PublishCommand,
  PublishCommandInput, 
  PublishCommandOutput, 
  SNSClient 
} from "@aws-sdk/client-sns";

const snsClient = new SNSClient({});

/**
 * 
 * @param input 
 * @returns 
 */
async function publish(input: PublishCommandInput): Promise<PublishCommandOutput> {
  const publishCommand = new PublishCommand(input);
  return await snsClient.send(publishCommand);
}

export default {
  publish
};
