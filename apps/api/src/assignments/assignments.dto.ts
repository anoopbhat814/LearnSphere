import { z } from 'zod';

export const createAssignmentSchema = z.object({
  lessonId: z.string().optional(),
  title: z.string().min(3).max(160),
  instructions: z.string().min(10),
  maxPoints: z.number().int().min(1).max(1000).default(100),
  dueAt: z.coerce.date().optional(),
});
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const submitSchema = z.object({
  body: z.string().max(20000).optional(),
  attachmentUrl: z.string().url().optional(),
}).refine((v) => v.body || v.attachmentUrl, { message: 'body or attachmentUrl is required' });
export type SubmitInput = z.infer<typeof submitSchema>;

export const gradeSchema = z.object({
  score: z.number().int().min(0),
  feedback: z.string().max(5000).optional(),
  returnToStudent: z.boolean().default(false),
});
export type GradeInput = z.infer<typeof gradeSchema>;
