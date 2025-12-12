import { v4 as uuidv4 } from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { BaseController } from './BaseController';

export class SimpleNoteController extends BaseController {
  constructor() {
    super();
  }

  async getNotes(event: APIGatewayProxyEvent) {
    try {
      return this.apiResponseOk({ message: 'Hello, world!', uuid: uuidv4() });
    } catch (error: any) {
      return this.apiResponseError(error);
    }
  }
}
