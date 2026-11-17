import { NotFoundException } from '@nestjs/common';
import { BadgesService, earnedCodes } from './badges.service';

describe('earnedCodes', () => {
  it.each([
    [{ completedCourses: 0, passedQuizzes: 0, gradedSubmissions: 0 }, [], []],
    [{ completedCourses: 1, passedQuizzes: 0, gradedSubmissions: 0 }, [], ['first_course']],
    [{ completedCourses: 5, passedQuizzes: 10, gradedSubmissions: 3 }, ['first_course'], ['course_collector', 'quiz_whiz', 'hands_on']],
    [{ completedCourses: 5, passedQuizzes: 0, gradedSubmissions: 0 }, ['first_course', 'course_collector'], []],
  ])('%j holding %j', (stats, held, expected) => {
    expect(earnedCodes(stats, new Set(held))).toEqual(expected);
  });
});

describe('BadgesService.evaluate', () => {
  it('awards new badges and skips codes with no badge row', async () => {
    const prisma: any = {
      enrollment: { count: jest.fn().mockResolvedValue(5) },
      quizAttempt: { count: jest.fn().mockResolvedValue(0) },
      submission: { count: jest.fn().mockResolvedValue(0) },
      userBadge: { findMany: jest.fn().mockResolvedValue([]), upsert: jest.fn() },
      badge: {
        findUnique: jest.fn().mockImplementation(async ({ where }) => (where.code === 'first_course' ? { id: 'b1' } : null)),
      },
    };
    const awarded = await new BadgesService(prisma).evaluate('u1');
    expect(awarded).toEqual(['first_course']);
    expect(prisma.userBadge.upsert).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException for unknown badge codes on direct award', async () => {
    const prisma: any = { badge: { findUnique: jest.fn().mockResolvedValue(null) } };
    await expect(new BadgesService(prisma).award('u1', 'nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});
