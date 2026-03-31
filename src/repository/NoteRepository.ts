import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Note } from '../domain/Note';

export class NoteRepository {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const dynamoDBClient = new DynamoDBClient({});
    this.client = DynamoDBDocumentClient.from(dynamoDBClient);
    this.tableName = process.env.NOTES_TABLE_NAME!;
  }

  async getNotes(): Promise<Note[]> {
    const result = await this.client.send(
      new ScanCommand({ TableName: this.tableName }),
    );
    return (result.Items || []) as Note[];
  }

  async createNote(note: Note): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: note,
      }),
    );
  }

  async updateNote(noteId: string, text: string, lastUpdate: number): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id: noteId },
        UpdateExpression: 'SET #text = :text, lastUpdate = :lastUpdate',
        ExpressionAttributeNames: { '#text': 'text' },
        ExpressionAttributeValues: { ':text': text, ':lastUpdate': lastUpdate },
      }),
    );
  }

  async deleteNote(noteId: string, lastUpdate: number): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id: noteId },
        UpdateExpression: 'SET #status = :status, lastUpdate = :lastUpdate',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': 'DELETED', ':lastUpdate': lastUpdate },
      }),
    );
  }
}
