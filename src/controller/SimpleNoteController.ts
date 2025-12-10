export class SimpleNoteController {
  constructor() {}

  async testMethod() {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello, world!' }),
    };
  }
}
