export type NoteStatus = 'ACTIVE' | 'DELETED';

export class Note {
  id: string;
  customerId: string;
  text: string;
  status: NoteStatus;
  creationDate: number;
  lastUpdate: number;
}
