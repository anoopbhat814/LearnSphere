import { z } from 'zod';

export const createBadgeSchema = z.object({
  code: z.string().regex(/^[a-z0-9_]{3,40}$/),
  name: z.string().min(2).max(60),
  description: z.string().min(5).max(300),
  iconUrl: z.string().url().optional(),
});
export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
