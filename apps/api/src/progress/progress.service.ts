import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { CourseProgressDto, percentComplete } from '@learnsphere/shared-types';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

  async recordLesson(userId: string, lessonId: string, watchedSec: number, completed: boolean) {
    const lesson = await this.prisma.lesson.findUniqueOrThrow({ where: { id: lessonId }, include: { module: true } });
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
    });
    if (!enrollment) throw new NotFoundException('Not enrolled');
    const progress = await this.prisma.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
      create: { enrollmentId: enrollment.id, lessonId, watchedSec, completed },
      update: { watchedSec, completed: completed || undefined },
    });
    const summary = await this.courseProgress(userId, lesson.module.courseId);
    if (summary.percent === 100 && enrollment.status !== 'COMPLETED') {
      await this.prisma.enrollment.update({ where: { id: enrollment.id }, data: { status: 'COMPLETED', completedAt: new Date() } });
      await this.redis.enqueue('certificates', { userId, courseId: lesson.module.courseId });
    }
    return progress;
  }

  async courseProgress(userId: string, courseId: string): Promise<CourseProgressDto> {
    const total = await this.prisma.lesson.count({ where: { module: { courseId } } });
    const rows = await this.prisma.lessonProgress.findMany({
      where: { enrollment: { userId, courseId } },
    });
    const completedLessons = rows.filter((r) => r.completed).length;
    return {
      courseId,
      completedLessons,
      totalLessons: total,
      percent: percentComplete(completedLessons, total),
      lessons: rows.map((r) => ({ lessonId: r.lessonId, watchedSec: r.watchedSec, completed: r.completed })),
    };
  }
}
