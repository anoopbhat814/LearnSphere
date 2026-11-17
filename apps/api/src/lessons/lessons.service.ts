import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async getForLearner(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
    });
    if (!enrollment) throw new ForbiddenException('Enroll in the course to view this lesson');
    return lesson;
  }

  async nextLesson(lessonId: string) {
    const current = await this.prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } });
    const sameModule = await this.prisma.lesson.findFirst({
      where: { moduleId: current.moduleId, position: { gt: current.position } },
      orderBy: { position: 'asc' },
    });
    if (sameModule) return sameModule;
    const module = await this.prisma.module.findUniqueOrThrow({ where: { id: current.moduleId } });
    const nextModule = await this.prisma.module.findFirst({
      where: { courseId: module.courseId, position: { gt: module.position } },
      orderBy: { position: 'asc' },
      include: { lessons: { orderBy: { position: 'asc' }, take: 1 } },
    });
    return nextModule?.lessons[0] ?? null;
  }
}
