import { APIGatewayProxyEvent } from 'aws-lambda';

export const simpleNoteHandler = async (event: APIGatewayProxyEvent) => {
  console.log('event', JSON.stringify(event, null, 2));

  if ('httpMethod' in event) {
    return Promise.resolve();
  }

  if ('detail-type' in event) {
    return Promise.resolve();
  }

  return Promise.resolve();
};
