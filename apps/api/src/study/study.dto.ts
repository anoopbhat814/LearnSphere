import { z } from 'zod';

export const createNoteSchema = z.object({ atSecond: z.number().int().min(0).default(0), body: z.string().min(1).max(4000) });
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({ body: z.string().min(1).max(4000) });
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export const toggleBookmarkSchema = z.object({ courseId: z.string().min(1), lessonId: z.string().optional() });
export type ToggleBookmarkInput = z.infer<typeof toggleBookmarkSchema>;
