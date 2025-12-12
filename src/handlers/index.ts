import { APIGatewayProxyEvent } from 'aws-lambda';
import { simpleNoteController } from '../controller';
import { ServiceUnavailableError } from '../exceptions/ServiceUnavailableError';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('event', JSON.stringify(event, null, 2));

  if ('httpMethod' in event) {
    if (event.httpMethod === 'GET') {
      return simpleNoteController.getNotes(event);
    }

    if (event.httpMethod === 'POST') {
      return simpleNoteController.apiResponseError(
        new ServiceUnavailableError({
          message: 'service unavailable',
          code: 'service_unavailable',
        }),
      );
    }
  }

  if ('detail-type' in event) {
    return Promise.resolve();
  }

  return Promise.resolve();
};
