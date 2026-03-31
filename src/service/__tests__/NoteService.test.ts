import { NoteService } from '../NoteService';
import { NoteRepository } from '../../repository/NoteRepository';
import { Note } from '../../domain/Note';

jest.mock('uuid', () => ({ v4: () => 'mocked-uuid' }));

const mockNote: Note = {
  id: 'mocked-uuid',
  text: 'Test note',
  status: 'ACTIVE',
  creationDate: 1000,
  lastUpdate: 1000,
};

describe('NoteService', () => {
  let repository: jest.Mocked<NoteRepository>;
  let service: NoteService;

  beforeEach(() => {
    repository = {
      getNotes: jest.fn(),
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
    } as unknown as jest.Mocked<NoteRepository>;

    service = new NoteService(repository);
  });

  // ─── getNotes ────────────────────────────────────────────────────────────────

  describe('getNotes', () => {
    it('returns the notes from the repository', async () => {
      repository.getNotes.mockResolvedValue([mockNote]);

      const result = await service.getNotes();

      expect(result).toEqual([mockNote]);
      expect(repository.getNotes).toHaveBeenCalledTimes(1);
    });

    it('returns an empty array when repository returns none', async () => {
      repository.getNotes.mockResolvedValue([]);

      const result = await service.getNotes();

      expect(result).toEqual([]);
    });

    it('propagates errors thrown by the repository', async () => {
      repository.getNotes.mockRejectedValue(new Error('DB error'));

      await expect(service.getNotes()).rejects.toThrow('DB error');
    });
  });

  // ─── createNote ──────────────────────────────────────────────────────────────

  describe('createNote', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(1000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('builds a note with the correct shape and calls repository.createNote', async () => {
      repository.createNote.mockResolvedValue();

      const result = await service.createNote('Test note');

      expect(result).toEqual({
        id: 'mocked-uuid',
        text: 'Test note',
        status: 'ACTIVE',
        creationDate: 1000,
        lastUpdate: 1000,
      });
      expect(repository.createNote).toHaveBeenCalledWith({
        id: 'mocked-uuid',
        text: 'Test note',
        status: 'ACTIVE',
        creationDate: 1000,
        lastUpdate: 1000,
      });
    });

    it('sets status to ACTIVE', async () => {
      repository.createNote.mockResolvedValue();

      const result = await service.createNote('Any text');

      expect(result.status).toEqual('ACTIVE');
    });

    it('propagates errors thrown by the repository', async () => {
      repository.createNote.mockRejectedValue(new Error('DB error'));

      await expect(service.createNote('Test note')).rejects.toThrow('DB error');
    });
  });

  // ─── updateNote ──────────────────────────────────────────────────────────────

  describe('updateNote', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(2000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('calls repository.updateNote with the correct arguments', async () => {
      repository.updateNote.mockResolvedValue();

      await service.updateNote('abc-123', 'Updated text');

      expect(repository.updateNote).toHaveBeenCalledWith('abc-123', 'Updated text', 2000);
    });

    it('propagates errors thrown by the repository', async () => {
      repository.updateNote.mockRejectedValue(new Error('DB error'));

      await expect(service.updateNote('abc-123', 'Updated text')).rejects.toThrow('DB error');
    });
  });

  // ─── deleteNote ──────────────────────────────────────────────────────────────

  describe('deleteNote', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(3000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('calls repository.deleteNote with the correct arguments', async () => {
      repository.deleteNote.mockResolvedValue();

      await service.deleteNote('abc-123');

      expect(repository.deleteNote).toHaveBeenCalledWith('abc-123', 3000);
    });

    it('propagates errors thrown by the repository', async () => {
      repository.deleteNote.mockRejectedValue(new Error('DB error'));

      await expect(service.deleteNote('abc-123')).rejects.toThrow('DB error');
    });
  });
});
