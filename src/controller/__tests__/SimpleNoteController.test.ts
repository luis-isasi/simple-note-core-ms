import { APIGatewayProxyEvent } from 'aws-lambda';
import { simpleNoteController } from '../index';

describe('Controller', () => {
  it('should return a 200 status code', async () => {
    // Prepare

    // Execute
    const result = await simpleNoteController.getNotes({
      httpMethod: 'GET',
      resource: '/notes',
    } as APIGatewayProxyEvent);

    // Validate
    expect(result.statusCode).toEqual(200);
    expect(result.body).toBeDefined();
  });
});
