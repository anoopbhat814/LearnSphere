import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateBadgeInput } from './badges.dto';

export interface LearnerStats {
  completedCourses: number;
  passedQuizzes: number;
  gradedSubmissions: number;
}

/** Rules that automatically award badges; each maps a badge code to a predicate over learner stats. */
export const AUTO_RULES: Record<string, (s: LearnerStats) => boolean> = {
  first_course: (s) => s.completedCourses >= 1,
  course_collector: (s) => s.completedCourses >= 5,
  quiz_whiz: (s) => s.passedQuizzes >= 10,
  hands_on: (s) => s.gradedSubmissions >= 3,
};

export function earnedCodes(stats: LearnerStats, alreadyHeld: ReadonlySet<string>): string[] {
  return Object.entries(AUTO_RULES)
    .filter(([code, rule]) => !alreadyHeld.has(code) && rule(stats))
    .map(([code]) => code);
}

@Injectable()
export class BadgesService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateBadgeInput) {
    return this.prisma.badge.create({ data: input });
  }

  forUser(userId: string) {
    return this.prisma.userBadge.findMany({ where: { userId }, include: { badge: true }, orderBy: { awardedAt: 'desc' } });
  }

  async award(userId: string, code: string) {
    const badge = await this.prisma.badge.findUnique({ where: { code } });
    if (!badge) throw new NotFoundException(`Badge ${code} not found`);
    return this.prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      create: { userId, badgeId: badge.id },
      update: {},
    });
  }

  /** Recomputes learner stats and awards any newly earned automatic badges; returns the new codes. */
  async evaluate(userId: string): Promise<string[]> {
    const [completedCourses, passedQuizzes, gradedSubmissions, held] = await Promise.all([
      this.prisma.enrollment.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.quizAttempt.count({ where: { userId, passed: true } }),
      this.prisma.submission.count({ where: { userId, status: { in: ['GRADED', 'RETURNED'] } } }),
      this.prisma.userBadge.findMany({ where: { userId }, include: { badge: { select: { code: true } } } }),
    ]);
    const codes = earnedCodes(
      { completedCourses, passedQuizzes, gradedSubmissions },
      new Set(held.map((h) => h.badge.code)),
    );
    const awarded: string[] = [];
    for (const code of codes) {
      try {
        await this.award(userId, code);
        awarded.push(code);
      } catch (e) {
        if (!(e instanceof NotFoundException)) throw e; // rule exists but badge row not seeded yet
      }
    }
    return awarded;
  }
}
