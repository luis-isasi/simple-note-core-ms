import { NoteService } from '../NoteService';
import { NoteRepository } from '../../repository/NoteRepository';
import { Note } from '../../domain/Note';
import { NotFoundError } from '../../exceptions/NotFoundError';

jest.mock('uuid', () => ({ v4: () => 'mocked-uuid' }));

const mockNote: Note = {
  id: 'mocked-uuid',
  customerId: 'customer-456',
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
      getNoteById: jest.fn(),
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
    } as unknown as jest.Mocked<NoteRepository>;

    service = new NoteService(repository);
  });

  // ─── getNotes ────────────────────────────────────────────────────────────────

  describe('getNotes', () => {
    it('returns the notes from the repository for the given customerId', async () => {
      repository.getNotes.mockResolvedValue([mockNote]);

      const result = await service.getNotes('customer-456');

      expect(result).toEqual([mockNote]);
      expect(repository.getNotes).toHaveBeenCalledWith('customer-456');
    });

    it('returns an empty array when repository returns none', async () => {
      repository.getNotes.mockResolvedValue([]);

      const result = await service.getNotes('customer-456');

      expect(result).toEqual([]);
    });

    it('propagates errors thrown by the repository', async () => {
      repository.getNotes.mockRejectedValue(new Error('DB error'));

      await expect(service.getNotes('customer-456')).rejects.toThrow('DB error');
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

      const result = await service.createNote('Test note', 'customer-456');

      expect(result).toEqual({
        id: 'mocked-uuid',
        customerId: 'customer-456',
        text: 'Test note',
        status: 'ACTIVE',
        creationDate: 1000,
        lastUpdate: 1000,
      });
      expect(repository.createNote).toHaveBeenCalledWith({
        id: 'mocked-uuid',
        customerId: 'customer-456',
        text: 'Test note',
        status: 'ACTIVE',
        creationDate: 1000,
        lastUpdate: 1000,
      });
    });

    it('sets status to ACTIVE', async () => {
      repository.createNote.mockResolvedValue();

      const result = await service.createNote('Any text', 'customer-456');

      expect(result.status).toEqual('ACTIVE');
    });

    it('propagates errors thrown by the repository', async () => {
      repository.createNote.mockRejectedValue(new Error('DB error'));

      await expect(service.createNote('Test note', 'customer-456')).rejects.toThrow('DB error');
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

    it('gets the note first and calls repository.updateNote with creationDate', async () => {
      repository.getNoteById.mockResolvedValue(mockNote);
      repository.updateNote.mockResolvedValue();

      await service.updateNote('mocked-uuid', 'Updated text');

      expect(repository.getNoteById).toHaveBeenCalledWith('mocked-uuid');
      expect(repository.updateNote).toHaveBeenCalledWith('mocked-uuid', 1000, 'Updated text', 2000);
    });

    it('throws NotFoundError with code 1.4.1 when note does not exist', async () => {
      repository.getNoteById.mockResolvedValue(null);

      await expect(service.updateNote('missing-id', 'Updated text')).rejects.toThrow(NotFoundError);

      const error = await service
        .updateNote('missing-id', 'Updated text')
        .catch((e) => e as NotFoundError);
      expect(error.props.code).toEqual('1.4.1');
    });

    it('does not call repository.updateNote when note is not found', async () => {
      repository.getNoteById.mockResolvedValue(null);

      await service.updateNote('missing-id', 'Updated text').catch(() => {});

      expect(repository.updateNote).not.toHaveBeenCalled();
    });

    it('propagates errors thrown by repository.getNoteById', async () => {
      repository.getNoteById.mockRejectedValue(new Error('DB error'));

      await expect(service.updateNote('mocked-uuid', 'Updated text')).rejects.toThrow('DB error');
    });

    it('propagates errors thrown by repository.updateNote', async () => {
      repository.getNoteById.mockResolvedValue(mockNote);
      repository.updateNote.mockRejectedValue(new Error('DB error'));

      await expect(service.updateNote('mocked-uuid', 'Updated text')).rejects.toThrow('DB error');
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

    it('gets the note first and calls repository.deleteNote with creationDate', async () => {
      repository.getNoteById.mockResolvedValue(mockNote);
      repository.deleteNote.mockResolvedValue();

      await service.deleteNote('mocked-uuid');

      expect(repository.getNoteById).toHaveBeenCalledWith('mocked-uuid');
      expect(repository.deleteNote).toHaveBeenCalledWith('mocked-uuid', 1000, 3000);
    });

    it('throws NotFoundError with code 1.4.2 when note does not exist', async () => {
      repository.getNoteById.mockResolvedValue(null);

      await expect(service.deleteNote('missing-id')).rejects.toThrow(NotFoundError);

      const error = await service.deleteNote('missing-id').catch((e) => e as NotFoundError);
      expect(error.props.code).toEqual('1.4.2');
    });

    it('does not call repository.deleteNote when note is not found', async () => {
      repository.getNoteById.mockResolvedValue(null);

      await service.deleteNote('missing-id').catch(() => {});

      expect(repository.deleteNote).not.toHaveBeenCalled();
    });

    it('propagates errors thrown by repository.getNoteById', async () => {
      repository.getNoteById.mockRejectedValue(new Error('DB error'));

      await expect(service.deleteNote('mocked-uuid')).rejects.toThrow('DB error');
    });

    it('propagates errors thrown by repository.deleteNote', async () => {
      repository.getNoteById.mockResolvedValue(mockNote);
      repository.deleteNote.mockRejectedValue(new Error('DB error'));

      await expect(service.deleteNote('mocked-uuid')).rejects.toThrow('DB error');
    });
  });
});
