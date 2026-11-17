import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  audience: z.enum(['COURSE', 'COHORT', 'ALL']).default('COURSE'),
  courseId: z.string().optional(),
  cohortId: z.string().optional(),
  title: z.string().min(3).max(140),
  body: z.string().min(1).max(10000),
  pinned: z.boolean().default(false),
}).superRefine((a, ctx) => {
  if (a.audience === 'COURSE' && !a.courseId) ctx.addIssue({ code: 'custom', path: ['courseId'], message: 'courseId is required for COURSE audience' });
  if (a.audience === 'COHORT' && !a.cohortId) ctx.addIssue({ code: 'custom', path: ['cohortId'], message: 'cohortId is required for COHORT audience' });
});
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
