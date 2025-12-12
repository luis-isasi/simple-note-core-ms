import { v4 as uuidv4 } from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';

export class SimpleNoteController {
  constructor() {}

  async testMethod(event: APIGatewayProxyEvent) {
    // const uuid = v5('test', 'test');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello, world!', uuid: uuidv4() }),
    };
  }
}
