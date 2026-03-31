import { NoteRepository } from '../repository/NoteRepository';
import { NoteService } from '../service/NoteService';
import { SimpleNoteController } from './SimpleNoteController';

const noteRepository = new NoteRepository();
const noteService = new NoteService(noteRepository);

export const simpleNoteController = new SimpleNoteController(noteService);
