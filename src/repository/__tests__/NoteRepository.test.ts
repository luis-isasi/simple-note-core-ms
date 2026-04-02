import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { NoteRepository } from '../NoteRepository';
import { Note } from '../../domain/Note';

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({})),
}));

// mockSend is created inside the factory (avoids jest.mock hoisting TDZ issue).
// We capture a reference to it by calling DynamoDBDocumentClient.from() after the mock is set up.
jest.mock('@aws-sdk/lib-dynamodb', () => {
  const mockSend = jest.fn();
  return {
    DynamoDBDocumentClient: {
      from: jest.fn().mockReturnValue({ send: mockSend }),
    },
    ScanCommand: jest.fn().mockImplementation((input) => ({ input })),
    QueryCommand: jest.fn().mockImplementation((input) => ({ input })),
    PutCommand: jest.fn().mockImplementation((input) => ({ input })),
    UpdateCommand: jest.fn().mockImplementation((input) => ({ input })),
  };
});

// DynamoDBDocumentClient.from is mocked with mockReturnValue, so it always
// returns the same { send: mockSend } object. Calling it here gives us the reference.
const mockSend = (DynamoDBDocumentClient.from as jest.Mock)().send as jest.Mock;

const TABLE_NAME = 'notes-table-test';

const mockNote: Note = {
  id: 'abc-123',
  text: 'Hello world',
  status: 'ACTIVE',
  creationDate: 1000,
  lastUpdate: 1000,
};

describe('NoteRepository', () => {
  let repository: NoteRepository;

  beforeEach(() => {
    process.env.NOTES_TABLE_NAME = TABLE_NAME;
    mockSend.mockReset();
    jest.mocked(ScanCommand).mockClear();
    jest.mocked(QueryCommand).mockClear();
    jest.mocked(PutCommand).mockClear();
    jest.mocked(UpdateCommand).mockClear();
    repository = new NoteRepository();
  });

  // ─── getNotes ────────────────────────────────────────────────────────────────

  describe('getNotes', () => {
    it('sends a ScanCommand with the correct table name', async () => {
      mockSend.mockResolvedValue({ Items: [mockNote] });

      await repository.getNotes();

      expect(ScanCommand).toHaveBeenCalledWith({ TableName: TABLE_NAME });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('returns the items from the scan result', async () => {
      mockSend.mockResolvedValue({ Items: [mockNote] });

      const result = await repository.getNotes();

      expect(result).toEqual([mockNote]);
    });

    it('returns an empty array when Items is undefined', async () => {
      mockSend.mockResolvedValue({});

      const result = await repository.getNotes();

      expect(result).toEqual([]);
    });

    it('propagates errors thrown by the client', async () => {
      mockSend.mockRejectedValue(new Error('DynamoDB error'));

      await expect(repository.getNotes()).rejects.toThrow('DynamoDB error');
    });
  });

  // ─── getNoteById ─────────────────────────────────────────────────────────────

  describe('getNoteById', () => {
    it('sends a QueryCommand with the correct key condition', async () => {
      mockSend.mockResolvedValue({ Items: [mockNote] });

      await repository.getNoteById('abc-123');

      expect(QueryCommand).toHaveBeenCalledWith({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: { ':id': 'abc-123' },
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('returns the note when found', async () => {
      mockSend.mockResolvedValue({ Items: [mockNote] });

      const result = await repository.getNoteById('abc-123');

      expect(result).toEqual(mockNote);
    });

    it('returns null when no items are found', async () => {
      mockSend.mockResolvedValue({ Items: [] });

      const result = await repository.getNoteById('abc-123');

      expect(result).toBeNull();
    });

    it('returns null when Items is undefined', async () => {
      mockSend.mockResolvedValue({});

      const result = await repository.getNoteById('abc-123');

      expect(result).toBeNull();
    });

    it('propagates errors thrown by the client', async () => {
      mockSend.mockRejectedValue(new Error('DynamoDB error'));

      await expect(repository.getNoteById('abc-123')).rejects.toThrow('DynamoDB error');
    });
  });

  // ─── createNote ──────────────────────────────────────────────────────────────

  describe('createNote', () => {
    it('sends a PutCommand with the correct table name and item', async () => {
      mockSend.mockResolvedValue({});

      await repository.createNote(mockNote);

      expect(PutCommand).toHaveBeenCalledWith({ TableName: TABLE_NAME, Item: mockNote });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('propagates errors thrown by the client', async () => {
      mockSend.mockRejectedValue(new Error('DynamoDB error'));

      await expect(repository.createNote(mockNote)).rejects.toThrow('DynamoDB error');
    });
  });

  // ─── updateNote ──────────────────────────────────────────────────────────────

  describe('updateNote', () => {
    it('sends an UpdateCommand with both partition key and sort key', async () => {
      mockSend.mockResolvedValue({});

      await repository.updateNote('abc-123', 1000, 'New text', 2000);

      expect(UpdateCommand).toHaveBeenCalledWith({
        TableName: TABLE_NAME,
        Key: { id: 'abc-123', creationDate: 1000 },
        UpdateExpression: 'SET #text = :text, lastUpdate = :lastUpdate',
        ExpressionAttributeNames: { '#text': 'text' },
        ExpressionAttributeValues: { ':text': 'New text', ':lastUpdate': 2000 },
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('propagates errors thrown by the client', async () => {
      mockSend.mockRejectedValue(new Error('DynamoDB error'));

      await expect(repository.updateNote('abc-123', 1000, 'New text', 2000)).rejects.toThrow(
        'DynamoDB error',
      );
    });
  });

  // ─── deleteNote ──────────────────────────────────────────────────────────────

  describe('deleteNote', () => {
    it('sends an UpdateCommand that sets status to DELETED with both keys', async () => {
      mockSend.mockResolvedValue({});

      await repository.deleteNote('abc-123', 1000, 3000);

      expect(UpdateCommand).toHaveBeenCalledWith({
        TableName: TABLE_NAME,
        Key: { id: 'abc-123', creationDate: 1000 },
        UpdateExpression: 'SET #status = :status, lastUpdate = :lastUpdate',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': 'DELETED', ':lastUpdate': 3000 },
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('propagates errors thrown by the client', async () => {
      mockSend.mockRejectedValue(new Error('DynamoDB error'));

      await expect(repository.deleteNote('abc-123', 1000, 3000)).rejects.toThrow('DynamoDB error');
    });
  });
});
