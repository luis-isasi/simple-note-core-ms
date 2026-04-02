import { APIGatewayProxyEvent } from 'aws-lambda';
import { BaseController } from './BaseController';
import { NoteService } from '../service/NoteService';
import { BadRequestError } from '../exceptions/BadRequestError';
import { createNoteSchema, updateNoteSchema } from './schemas/note.schema';

export class SimpleNoteController extends BaseController {
  constructor(private service: NoteService) {
    super();
  }

  async getNotes(_event: APIGatewayProxyEvent) {
    try {
      const notes = await this.service.getNotes();
      return this.apiResponseOk({ notes });
    } catch (error: any) {
      return this.apiResponseError(error);
    }
  }

  async createNote(event: APIGatewayProxyEvent) {
    try {
      const body = this.parseBody(event.body);
      const parsed = createNoteSchema.safeParse(body);

      if (!parsed.success) {
        throw new BadRequestError({
          code: '1.2.2',
          message: parsed.error.issues.map((i) => i.message).join(', '),
        });
      }

      const note = await this.service.createNote(parsed.data.text);
      return this.apiResponseCreated(note);
    } catch (error: any) {
      return this.apiResponseError(error);
    }
  }

  async updateNote(event: APIGatewayProxyEvent) {
    try {
      const noteId = event.pathParameters?.noteId;
      if (!noteId) {
        throw new BadRequestError({
          code: '1.2.3',
          message: 'noteId path parameter is required',
        });
      }

      const body = this.parseBody(event.body);
      const parsed = updateNoteSchema.safeParse(body);

      if (!parsed.success) {
        throw new BadRequestError({
          code: '1.2.4',
          message: parsed.error.issues.map((i) => i.message).join(', '),
        });
      }

      await this.service.updateNote(noteId, parsed.data.text);
      return this.apiResponseOk();
    } catch (error: any) {
      return this.apiResponseError(error);
    }
  }

  async deleteNote(event: APIGatewayProxyEvent) {
    try {
      const noteId = event.pathParameters?.noteId;
      if (!noteId) {
        throw new BadRequestError({
          code: '1.2.5',
          message: 'noteId path parameter is required',
        });
      }

      await this.service.deleteNote(noteId);
      return this.apiResponseOk();
    } catch (error: any) {
      return this.apiResponseError(error);
    }
  }

  private parseBody(raw: string | null): unknown {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      throw new BadRequestError({
        code: '1.2.1',
        message: 'Request body must be valid JSON',
      });
    }
  }
}
