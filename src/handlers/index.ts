import { APIGatewayProxyEvent } from 'aws-lambda';
import { simpleNoteController } from '../controller';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('event', JSON.stringify(event, null, 2));

  if ('httpMethod' in event) {
    const { httpMethod, resource } = event;

    if (httpMethod === 'GET' && resource === '/notes') {
      return simpleNoteController.getNotes(event);
    }

    if (httpMethod === 'POST' && resource === '/notes') {
      return simpleNoteController.createNote(event);
    }

    if (httpMethod === 'PUT' && resource === '/notes/{noteId}') {
      return simpleNoteController.updateNote(event);
    }

    if (httpMethod === 'DELETE' && resource === '/notes/{noteId}') {
      return simpleNoteController.deleteNote(event);
    }
  }

  if ('detail-type' in event) {
    return Promise.resolve();
  }

  return Promise.resolve();
};
