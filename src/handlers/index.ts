import { APIGatewayProxyEvent } from 'aws-lambda';
import { simpleNoteController } from '../controller';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('event', JSON.stringify(event, null, 2));

  if ('httpMethod' in event) {
    if (event.httpMethod === 'POST') {
      return simpleNoteController.testMethod(event);
    }
  }

  if ('detail-type' in event) {
    return Promise.resolve();
  }

  return Promise.resolve();
};
