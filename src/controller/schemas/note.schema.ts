import { z } from 'zod';

export const createNoteSchema = z.object({
  text: z.string().min(1),
});

export const updateNoteSchema = z.object({
  text: z.string().min(1),
});
