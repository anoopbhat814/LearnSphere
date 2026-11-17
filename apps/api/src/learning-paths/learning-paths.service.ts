import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePathInput } from './learning-paths.dto';

export interface PathProgress {
  slug: string;
  total: number;
  completed: number;
  percent: number;
  nextCourseId: string | null;
}

/** Pure helper so progress maths can be tested without a database. */
export function summarisePath(slug: string, orderedCourseIds: string[], completedCourseIds: Set<string>): PathProgress {
  const completed = orderedCourseIds.filter((id) => completedCourseIds.has(id)).length;
  const next = orderedCourseIds.find((id) => !completedCourseIds.has(id)) ?? null;
  return {
    slug,
    total: orderedCourseIds.length,
    completed,
    percent: orderedCourseIds.length ? Math.round((completed / orderedCourseIds.length) * 100) : 0,
    nextCourseId: next,
  };
}

@Injectable()
export class LearningPathsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.learningPath.findMany({
      where: { published: true },
      orderBy: { title: 'asc' },
      include: { _count: { select: { courses: true } } },
    });
  }

  async get(slug: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { slug },
      include: { courses: { orderBy: { position: 'asc' }, include: { course: { select: { id: true, slug: true, title: true, level: true } } } } },
    });
    if (!path) throw new NotFoundException('Learning path not found');
    return path;
  }

  create(input: CreatePathInput) {
    const { courseIds, ...rest } = input;
    return this.prisma.learningPath.create({
      data: { ...rest, courses: { create: courseIds.map((courseId, i) => ({ courseId, position: i + 1 })) } },
    });
  }

  async progress(userId: string, slug: string): Promise<PathProgress> {
    const path = await this.get(slug);
    const ids = path.courses.map((c) => c.courseId);
    const done = await this.prisma.enrollment.findMany({
      where: { userId, courseId: { in: ids }, status: 'COMPLETED' },
      select: { courseId: true },
    });
    return summarisePath(slug, ids, new Set(done.map((d) => d.courseId)));
  }
}
