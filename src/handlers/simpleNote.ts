import 'source-map-support/register';
import { APIGatewayProxyEvent } from 'aws-lambda';



export const eventsHandler = async (
  event: APIGatewayProxyEvent,
) => {

  if (await eventsController.validateIsPanicEnabled(event))
    return eventsController.apiResponseServiceUnavailableError();

  if ('httpMethod' in event) {
    if (event.resource === '/events/statements') {
      if (event.httpMethod === 'POST') {
        return eventsController.createStatement(event);
      }
    }

    if (event.resource === '/events') {
      if (event.httpMethod === 'GET') {
        return eventsController.findEvents(event);
      }
    }

    return eventsController.apiResponseError();
  }

  if ('detail-type' in event) {
    if (event['detail-type'] === 'Scheduled Event') {
      return eventsController.processSummaryEvent();
    }
    await eventsController.create(event);
    await analyticsController.sendToGoogleTagManager(event);
    return eventsController.eventResponseOk(event);
  }

  return Promise.resolve();
};
