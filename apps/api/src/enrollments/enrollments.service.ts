import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

  async enroll(userId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({ where: { id: courseId, status: 'PUBLISHED' } });
    if (!course) throw new NotFoundException('Course not available');
    const existing = await this.prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
    if (existing) throw new ConflictException('Already enrolled');
    const enrollment = await this.prisma.enrollment.create({ data: { userId, courseId } });
    await this.redis.enqueue('notifications', { kind: 'enrollment.welcome', userId, courseId });
    await this.redis.invalidate(`recs:${userId}:*`);
    return enrollment;
  }

  listForUser(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId, status: { not: 'DROPPED' } },
      include: { course: { select: { id: true, slug: true, title: true, thumbnailUrl: true } } },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  drop(userId: string, courseId: string) {
    return this.prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { status: 'DROPPED' },
    });
  }
}
