import { CohortsService } from './cohorts.service';

describe('CohortsService', () => {
  const make = (cohort: any, enrolled = true) => {
    const prisma: any = {
      cohort: { findUnique: jest.fn().mockResolvedValue(cohort), findMany: jest.fn() },
      enrollment: { findUnique: jest.fn().mockResolvedValue(enrolled ? { id: 'e' } : null) },
      cohortMember: { upsert: jest.fn().mockResolvedValue({ ok: true }) },
    };
    return { prisma, service: new CohortsService(prisma) };
  };

  it.each([
    ['missing cohort', null, true, 'not found'],
    ['not enrolled', { courseId: 'c', capacity: null, _count: { members: 0 } }, false, 'Enrol'],
    ['full cohort', { courseId: 'c', capacity: 2, _count: { members: 2 } }, true, 'full'],
  ])('refuses to join: %s', async (_n, cohort, enrolled, message) => {
    const { service } = make(cohort, enrolled);
    await expect(service.join('u1', 'k1')).rejects.toThrow(message);
  });

  it('joins when seats are available', async () => {
    const { service, prisma } = make({ courseId: 'c', capacity: 3, _count: { members: 2 } });
    await service.join('u1', 'k1');
    expect(prisma.cohortMember.upsert).toHaveBeenCalled();
  });

  it('reports seats left when listing', async () => {
    const { service, prisma } = make(null);
    prisma.cohort.findMany.mockResolvedValue([
      { id: 'a', capacity: 5, _count: { members: 3 } },
      { id: 'b', capacity: null, _count: { members: 9 } },
    ]);
    const list = await service.listUpcoming('c1');
    expect(list.map((c) => c.seatsLeft)).toEqual([2, null]);
  });
});
