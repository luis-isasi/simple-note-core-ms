import { APIGatewayProxyEvent } from 'aws-lambda';
import { SimpleNoteController } from '../SimpleNoteController';
import { NoteService } from '../../service/NoteService';
import { Note } from '../../domain/Note';
import { ServiceUnavailableError } from '../../exceptions/ServiceUnavailableError';

const makeEvent = (
  overrides: Partial<APIGatewayProxyEvent> = {},
): APIGatewayProxyEvent =>
  ({
    httpMethod: 'GET',
    resource: '/notes',
    body: null,
    pathParameters: null,
    ...overrides,
  }) as APIGatewayProxyEvent;

const mockNote: Note = {
  id: 'abc-123',
  customerId: 'customer-456',
  text: 'Hello world',
  status: 'ACTIVE',
  creationDate: 1000,
  lastUpdate: 1000,
};

describe('SimpleNoteController', () => {
  let service: jest.Mocked<NoteService>;
  let controller: SimpleNoteController;

  beforeEach(() => {
    service = {
      getNotes: jest.fn(),
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
    } as unknown as jest.Mocked<NoteService>;

    controller = new SimpleNoteController(service);
  });

  // ─── getNotes ────────────────────────────────────────────────────────────────

  describe('getNotes', () => {
    it('returns 200 with notes list when customerId is provided', async () => {
      service.getNotes.mockResolvedValue([mockNote]);

      const result = await controller.getNotes(
        makeEvent({ queryStringParameters: { customerId: 'customer-456' } }),
      );

      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body!)).toEqual({ notes: [mockNote] });
      expect(service.getNotes).toHaveBeenCalledWith('customer-456');
    });

    it('returns 400 with code 1.2.6 when customerId is missing', async () => {
      const result = await controller.getNotes(makeEvent());

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toMatchObject({ code: '1.2.6' });
    });

    it('returns 500 with code 1.1.1 when service throws an unknown error', async () => {
      service.getNotes.mockRejectedValue(new Error('DB error'));

      const result = await controller.getNotes(
        makeEvent({ queryStringParameters: { customerId: 'customer-456' } }),
      );

      expect(result.statusCode).toEqual(500);
      expect(JSON.parse(result.body!)).toMatchObject({ code: '1.1.1' });
    });

    it('returns the service error code when service throws a known error', async () => {
      service.getNotes.mockRejectedValue(
        new ServiceUnavailableError({
          code: 'service_unavailable',
          message: 'down',
        }),
      );

      const result = await controller.getNotes(
        makeEvent({ queryStringParameters: { customerId: 'customer-456' } }),
      );

      expect(result.statusCode).toEqual(503);
      expect(JSON.parse(result.body!)).toMatchObject({
        code: 'service_unavailable',
      });
    });
  });

  // ─── createNote ──────────────────────────────────────────────────────────────

  describe('createNote', () => {
    it('returns 201 with created note when customerId is provided', async () => {
      service.createNote.mockResolvedValue(mockNote);

      const result = await controller.createNote(
        makeEvent({
          httpMethod: 'POST',
          queryStringParameters: { customerId: 'customer-456' },
          body: JSON.stringify({ text: 'Hello world' }),
        }),
      );

      expect(result.statusCode).toEqual(201);
      expect(JSON.parse(result.body!)).toEqual(mockNote);
      expect(service.createNote).toHaveBeenCalledWith('Hello world', 'customer-456');
    });

    it('returns 400 with code 1.2.7 when customerId is missing', async () => {
      const result = await controller.createNote(
        makeEvent({ httpMethod: 'POST', body: JSON.stringify({ text: 'Hello world' }) }),
      );

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toMatchObject({ code: '1.2.7' });
    });

    it('returns 400 with code 1.2.2 and zod message when body is missing text', async () => {
      const result = await controller.createNote(
        makeEvent({
          httpMethod: 'POST',
          queryStringParameters: { customerId: 'customer-456' },
          body: JSON.stringify({}),
        }),
      );

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toMatchObject({
        code: '1.2.2',
        message: 'Invalid input: expected string, received undefined',
      });
    });

    it('returns 400 with code 1.2.2 and zod message when text is empty string', async () => {
      const result = await controller.createNote(
        makeEvent({
          httpMethod: 'POST',
          queryStringParameters: { customerId: 'customer-456' },
          body: JSON.stringify({ text: '' }),
        }),
      );

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toMatchObject({
        code: '1.2.2',
        message: 'Too small: expected string to have >=1 characters',
      });
    });

    it('returns 400 with code 1.2.1 when body is invalid JSON', async () => {
      const result = await controller.createNote(
        makeEvent({
          httpMethod: 'POST',
          queryStringParameters: { customerId: 'customer-456' },
          body: 'not-json',
        }),
      );

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toMatchObject({ code: '1.2.1' });
    });

    it('returns 400 with code 1.2.2 when body is null', async () => {
      const result = await controller.createNote(
        makeEvent({
          httpMethod: 'POST',
          queryStringParameters: { customerId: 'customer-456' },
          body: null,
        }),
      );

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toMatchObject({ code: '1.2.2' });
    });

    it('returns 500 when service throws', async () => {
      service.createNote.mockRejectedValue(new Error('DB error'));

      const result = await controller.createNote(
        makeEvent({
          httpMethod: 'POST',
          queryStringParameters: { customerId: 'customer-456' },
          body: JSON.stringify({ text: 'Hello' }),
        }),
      );

      expect(result.statusCode).toEqual(500);
    });
  });

  // ─── updateNote ──────────────────────────────────────────────────────────────

  describe('updateNote', () => {
    it('returns 200 when note is updated', async () => {
      service.updateNote.mockResolvedValue();

      const result = await controller.updateNote(
        makeEvent({
          httpMethod: 'PUT',
          resource: '/notes/{noteId}',
          pathParameters: { noteId: 'abc-123' },
          body: JSON.stringify({ text: 'Updated text' }),
        }),
      );

      expect(result.statusCode).toEqual(200);
      expect(service.updateNote).toHaveBeenCalledWith('abc-123', 'Updated text');
    });

    it('returns 400 with code 1.2.3 when noteId is missing', async () => {
      const result = await controller.updateNote(
        makeEvent({
          httpMethod: 'PUT',
          resource: '/notes/{noteId}',
          pathParameters: null,
          body: JSON.stringify({ text: 'Updated text' }),
        }),
      );

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toMatchObject({ code: '1.2.3' });
    });

    it('returns 400 with code 1.2.4 and zod message when body validation fails', async () => {
      const result = await controller.updateNote(
        makeEvent({
          httpMethod: 'PUT',
          resource: '/notes/{noteId}',
          pathParameters: { noteId: 'abc-123' },
          body: JSON.stringify({ text: '' }),
        }),
      );

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toMatchObject({
        code: '1.2.4',
        message: 'Too small: expected string to have >=1 characters',
      });
    });

    it('returns 500 when service throws', async () => {
      service.updateNote.mockRejectedValue(new Error('DB error'));

      const result = await controller.updateNote(
        makeEvent({
          httpMethod: 'PUT',
          resource: '/notes/{noteId}',
          pathParameters: { noteId: 'abc-123' },
          body: JSON.stringify({ text: 'Updated text' }),
        }),
      );

      expect(result.statusCode).toEqual(500);
    });
  });

  // ─── deleteNote ──────────────────────────────────────────────────────────────

  describe('deleteNote', () => {
    it('returns 200 when note is deleted', async () => {
      service.deleteNote.mockResolvedValue();

      const result = await controller.deleteNote(
        makeEvent({
          httpMethod: 'DELETE',
          resource: '/notes/{noteId}',
          pathParameters: { noteId: 'abc-123' },
        }),
      );

      expect(result.statusCode).toEqual(200);
      expect(service.deleteNote).toHaveBeenCalledWith('abc-123');
    });

    it('returns 400 with code 1.2.5 when noteId is missing', async () => {
      const result = await controller.deleteNote(
        makeEvent({
          httpMethod: 'DELETE',
          resource: '/notes/{noteId}',
          pathParameters: null,
        }),
      );

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toMatchObject({ code: '1.2.5' });
    });

    it('returns 500 when service throws', async () => {
      service.deleteNote.mockRejectedValue(new Error('DB error'));

      const result = await controller.deleteNote(
        makeEvent({
          httpMethod: 'DELETE',
          resource: '/notes/{noteId}',
          pathParameters: { noteId: 'abc-123' },
        }),
      );

      expect(result.statusCode).toEqual(500);
    });
  });
});
