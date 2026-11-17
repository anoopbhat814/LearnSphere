import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ScheduleSessionInput, TransitionInput } from './live-sessions.dto';

type Status = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELED';

export const NEXT_STATES: Record<Status, Status[]> = {
  SCHEDULED: ['LIVE', 'CANCELED'],
  LIVE: ['ENDED'],
  ENDED: [],
  CANCELED: [],
};

export function canTransition(from: Status, to: Status): boolean {
  return NEXT_STATES[from].includes(to);
}

@Injectable()
export class LiveSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  schedule(hostId: string, courseId: string, input: ScheduleSessionInput) {
    return this.prisma.liveSession.create({ data: { hostId, courseId, ...input } });
  }

  upcoming(courseId: string, now = new Date()) {
    return this.prisma.liveSession.findMany({
      where: { courseId, status: { in: ['SCHEDULED', 'LIVE'] }, startsAt: { gte: new Date(now.getTime() - 4 * 3600_000) } },
      orderBy: { startsAt: 'asc' },
      include: { host: { select: { displayName: true } } },
    });
  }

  async transition(userId: string, role: string, id: string, input: TransitionInput) {
    const session = await this.prisma.liveSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Live session not found');
    if (session.hostId !== userId && role !== 'ADMIN') throw new ForbiddenException('Only the host can change this session');
    if (!canTransition(session.status as Status, input.status)) {
      throw new BadRequestException(`Cannot move session from ${session.status} to ${input.status}`);
    }
    return this.prisma.liveSession.update({
      where: { id },
      data: { status: input.status, recordingAssetId: input.status === 'ENDED' ? input.recordingAssetId : undefined },
    });
  }
}
