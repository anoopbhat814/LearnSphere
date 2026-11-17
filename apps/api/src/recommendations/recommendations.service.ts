import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

interface Recommendation {
  courseId: string;
  score: number;
  reason: string;
}

@Injectable()
export class RecommendationsService {
  private readonly log = new Logger(RecommendationsService.name);
  private readonly baseUrl = process.env.RECOMMENDER_URL ?? 'http://localhost:8000';

  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

  forUser(userId: string, limit = 8): Promise<Recommendation[]> {
    return this.redis.cached(`recs:${userId}:${limit}`, 300, async () => {
      const enrolled = await this.prisma.enrollment.findMany({ where: { userId }, select: { courseId: true } });
      try {
        const res = await fetch(`${this.baseUrl}/recommend`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ user_id: userId, enrolled_course_ids: enrolled.map((e) => e.courseId), limit }),
        });
        if (!res.ok) throw new Error(`recommender responded ${res.status}`);
        const data = (await res.json()) as { items: { course_id: string; score: number; reason: string }[] };
        return data.items.map((i) => ({ courseId: i.course_id, score: i.score, reason: i.reason }));
      } catch (err) {
        this.log.warn(`Falling back to popular courses: ${(err as Error).message}`);
        return this.popularFallback(enrolled.map((e) => e.courseId), limit);
      }
    });
  }

  private async popularFallback(exclude: string[], limit: number): Promise<Recommendation[]> {
    const popular = await this.prisma.course.findMany({
      where: { status: 'PUBLISHED', id: { notIn: exclude } },
      orderBy: { enrollments: { _count: 'desc' } },
      take: limit,
    });
    return popular.map((c, i) => ({ courseId: c.id, score: 1 - i * 0.05, reason: 'Popular right now' }));
  }
}
