import { v4 as uuidv4 } from 'uuid';
import { Note } from '../domain/Note';
import { NoteRepository } from '../repository/NoteRepository';
import { NotFoundError } from '../exceptions/NotFoundError';

export class NoteService {
  constructor(private repository: NoteRepository) {}

  async getNotes(): Promise<Note[]> {
    return this.repository.getNotes();
  }

  async createNote(text: string): Promise<Note> {
    const now = Date.now();
    const note: Note = {
      id: uuidv4(),
      text,
      status: 'ACTIVE',
      creationDate: now,
      lastUpdate: now,
    };
    await this.repository.createNote(note);
    return note;
  }

  async updateNote(noteId: string, text: string): Promise<void> {
    const note = await this.repository.getNoteById(noteId);
    if (!note) {
      throw new NotFoundError({ code: '1.4.1', message: 'Note not found' });
    }
    await this.repository.updateNote(noteId, note.creationDate, text, Date.now());
  }

  async deleteNote(noteId: string): Promise<void> {
    const note = await this.repository.getNoteById(noteId);
    if (!note) {
      throw new NotFoundError({ code: '1.4.2', message: 'Note not found' });
    }
    await this.repository.deleteNote(noteId, note.creationDate, Date.now());
  }
}
