export interface LessonProgressDto {
  lessonId: string;
  watchedSec: number;
  completed: boolean;
}

export interface CourseProgressDto {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  percent: number;
  lessons: LessonProgressDto[];
}

export interface CertificateDto {
  id: string;
  code: string;
  courseTitle: string;
  recipientName: string;
  issuedAt: string;
  pdfUrl?: string | null;
}

export function percentComplete(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}
