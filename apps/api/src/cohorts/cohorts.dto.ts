import { z } from 'zod';

export const createCohortSchema = z.object({
  name: z.string().min(2).max(80),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  capacity: z.number().int().positive().optional(),
}).refine((c) => !c.endsAt || c.endsAt > c.startsAt, { message: 'endsAt must be after startsAt', path: ['endsAt'] });
export type CreateCohortInput = z.infer<typeof createCohortSchema>;
