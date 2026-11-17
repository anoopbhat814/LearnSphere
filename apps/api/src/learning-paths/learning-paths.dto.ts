import { z } from 'zod';

export const createPathSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(60),
  title: z.string().min(3).max(120),
  description: z.string().min(10),
  courseIds: z.array(z.string()).min(1).max(20),
  published: z.boolean().default(false),
}).refine((p) => new Set(p.courseIds).size === p.courseIds.length, { message: 'courseIds must be unique', path: ['courseIds'] });
export type CreatePathInput = z.infer<typeof createPathSchema>;
