import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAnnouncementInput } from './announcements.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async publish(authorId: string, role: string, input: CreateAnnouncementInput) {
    if (input.audience === 'ALL' && role !== 'ADMIN') throw new ForbiddenException('Only admins can address everyone');
    const announcement = await this.prisma.announcement.create({ data: { authorId, ...input } });
    await this.fanOut(announcement.id, input);
    return announcement;
  }

  /** Creates an in-app Notification row for every recipient of the announcement. */
  private async fanOut(announcementId: string, input: CreateAnnouncementInput) {
    const recipients = await this.recipientIds(input);
    if (!recipients.length) return;
    await this.prisma.notification.createMany({
      data: recipients.map((userId) => ({ userId, kind: 'announcement', payload: { announcementId, title: input.title } })),
    });
  }

  private async recipientIds(input: CreateAnnouncementInput): Promise<string[]> {
    if (input.audience === 'COHORT') {
      const rows = await this.prisma.cohortMember.findMany({ where: { cohortId: input.cohortId }, select: { userId: true } });
      return rows.map((r) => r.userId);
    }
    if (input.audience === 'COURSE') {
      const rows = await this.prisma.enrollment.findMany({ where: { courseId: input.courseId, status: 'ACTIVE' }, select: { userId: true } });
      return rows.map((r) => r.userId);
    }
    const rows = await this.prisma.user.findMany({ select: { id: true } });
    return rows.map((r) => r.id);
  }

  feed(courseId: string, limit = 20) {
    return this.prisma.announcement.findMany({
      where: { OR: [{ courseId }, { audience: 'ALL' }] },
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
      take: Math.min(Math.max(limit, 1), 100),
      include: { author: { select: { displayName: true } } },
    });
  }
}
