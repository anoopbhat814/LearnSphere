import { z } from 'zod';

export const scheduleSessionSchema = z.object({
  cohortId: z.string().optional(),
  title: z.string().min(3).max(140),
  startsAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), { message: 'startsAt must be in the future' }),
  durationMin: z.number().int().min(5).max(480).default(60),
  joinUrl: z.string().url().optional(),
});
export type ScheduleSessionInput = z.infer<typeof scheduleSessionSchema>;

export const transitionSchema = z.object({ status: z.enum(['LIVE', 'ENDED', 'CANCELED']), recordingAssetId: z.string().optional() });
export type TransitionInput = z.infer<typeof transitionSchema>;
