import { z } from 'zod';

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type LessonType = 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'ASSIGNMENT';

export interface LessonDto {
  id: string;
  title: string;
  type: LessonType;
  position: number;
  durationSeconds: number;
}

export interface ModuleDto {
  id: string;
  title: string;
  position: number;
  lessons: LessonDto[];
}

export interface CourseSummaryDto {
  id: string;
  slug: string;
  title: string;
  summary: string;
  level: CourseLevel;
  priceCents: number;
  thumbnailUrl?: string | null;
  instructorName: string;
  rating: number | null;
  enrollmentCount: number;
}

export interface CourseDetailDto extends CourseSummaryDto {
  description: string;
  modules: ModuleDto[];
  tags: string[];
}

export const createCourseSchema = z.object({
  title: z.string().min(5).max(120),
  summary: z.string().min(10).max(280),
  description: z.string().min(30),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  priceCents: z.number().int().nonnegative(),
  categoryId: z.string(),
  tags: z.array(z.string()).max(8).default([]),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export interface CourseQuery {
  search?: string;
  level?: CourseLevel;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function totalDuration(modules: ModuleDto[]): number {
  return modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.durationSeconds, 0),
    0,
  );
}
