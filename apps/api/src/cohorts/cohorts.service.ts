import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCohortInput } from './cohorts.dto';

@Injectable()
export class CohortsService {
  constructor(private readonly prisma: PrismaService) {}

  create(courseId: string, input: CreateCohortInput) {
    return this.prisma.cohort.create({ data: { courseId, ...input } });
  }

  async listUpcoming(courseId: string, now = new Date()) {
    const cohorts = await this.prisma.cohort.findMany({
      where: { courseId, OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      orderBy: { startsAt: 'asc' },
      include: { _count: { select: { members: true } } },
    });
    return cohorts.map(({ _count, ...c }) => ({
      ...c,
      memberCount: _count.members,
      seatsLeft: c.capacity === null ? null : Math.max(c.capacity - _count.members, 0),
    }));
  }

  async join(userId: string, cohortId: string) {
    const cohort = await this.prisma.cohort.findUnique({ where: { id: cohortId }, include: { _count: { select: { members: true } } } });
    if (!cohort) throw new NotFoundException('Cohort not found');
    const enrolled = await this.prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: cohort.courseId } } });
    if (!enrolled) throw new ForbiddenException('Enrol in the course before joining a cohort');
    if (cohort.capacity !== null && cohort._count.members >= cohort.capacity) throw new ConflictException('Cohort is full');
    return this.prisma.cohortMember.upsert({
      where: { cohortId_userId: { cohortId, userId } },
      create: { cohortId, userId },
      update: {},
    });
  }

  leave(userId: string, cohortId: string) {
    return this.prisma.cohortMember.delete({ where: { cohortId_userId: { cohortId, userId } } });
  }
}
