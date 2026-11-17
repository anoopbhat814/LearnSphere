import { AssignmentsService } from './assignments.service';

describe('AssignmentsService', () => {
  const build = (overrides: Record<string, any> = {}) => {
    const prisma: any = {
      assignment: { findUnique: jest.fn().mockResolvedValue({ id: 'a1', courseId: 'c1', maxPoints: 50 }) },
      enrollment: { findUnique: jest.fn().mockResolvedValue({ id: 'e1' }) },
      submission: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockImplementation(async (args) => args.create),
        update: jest.fn().mockImplementation(async (args) => args.data),
      },
      ...overrides,
    };
    return { prisma, service: new AssignmentsService(prisma) };
  };

  it('rejects submissions from users who are not enrolled', async () => {
    const { service } = build({ enrollment: { findUnique: jest.fn().mockResolvedValue(null) } });
    await expect(service.submit('u1', 'a1', { body: 'x' })).rejects.toThrow('Enrol');
  });

  it('stores drafts without a submittedAt timestamp', async () => {
    const { service } = build();
    const saved: any = await service.submit('u1', 'a1', { body: 'wip' }, true);
    expect(saved.status).toBe('DRAFT');
    expect(saved.submittedAt).toBeNull();
  });

  it('locks graded submissions', async () => {
    const { service } = build();
    const { prisma } = build();
    prisma.submission.findUnique.mockResolvedValue({ status: 'GRADED' });
    await expect(new AssignmentsService(prisma).submit('u1', 'a1', { body: 'again' })).rejects.toThrow('locked');
    expect(service).toBeDefined();
  });

  it('refuses scores above maxPoints and grades drafts', async () => {
    const { prisma } = build();
    prisma.submission.findUnique.mockResolvedValue({ id: 's1', status: 'SUBMITTED', assignment: { maxPoints: 50 } });
    const service = new AssignmentsService(prisma);
    await expect(service.grade('g1', 's1', { score: 80, returnToStudent: false })).rejects.toThrow('exceeds');
    prisma.submission.findUnique.mockResolvedValue({ id: 's1', status: 'DRAFT', assignment: { maxPoints: 50 } });
    await expect(service.grade('g1', 's1', { score: 10, returnToStudent: false })).rejects.toThrow('draft');
  });

  it('marks returned submissions when requested', async () => {
    const { prisma } = build();
    prisma.submission.findUnique.mockResolvedValue({ id: 's1', status: 'SUBMITTED', assignment: { maxPoints: 50 } });
    const result: any = await new AssignmentsService(prisma).grade('g1', 's1', { score: 40, returnToStudent: true });
    expect(result).toMatchObject({ status: 'RETURNED', score: 40, graderId: 'g1' });
  });
});
