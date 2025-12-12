import { v5 } from 'uuid';

export class SimpleNoteController {
  constructor() {}

  async testMethod() {
    // const uuid = v5('test', 'test');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello, world!', uuid: 'asfafsnfa' }),
    };
  }
}
