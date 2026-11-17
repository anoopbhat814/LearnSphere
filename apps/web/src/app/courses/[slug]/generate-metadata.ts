import type { Metadata } from 'next';
import { api } from '../../../lib/api';

export async function buildCourseMetadata(slug: string): Promise<Metadata> {
  const course = await api.getCourse(slug).catch(() => null);
  if (!course) return { title: 'Course not found' };
  return {
    title: `${course.title} | LearnSphere`,
    description: course.summary,
    openGraph: { title: course.title, description: course.summary, type: 'article' },
  };
}
