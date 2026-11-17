import { createAnnouncementSchema } from './announcements.dto';
import { AnnouncementsService } from './announcements.service';

describe('createAnnouncementSchema', () => {
  it.each([
    [{ audience: 'COURSE', title: 'Hello', body: 'x' }, false],
    [{ audience: 'COURSE', courseId: 'c1', title: 'Hello', body: 'x' }, true],
    [{ audience: 'COHORT', title: 'Hello', body: 'x' }, false],
    [{ audience: 'ALL', title: 'Maintenance', body: 'x' }, true],
  ])('%j valid=%s', (input, ok) => expect(createAnnouncementSchema.safeParse(input).success).toBe(ok));
});

describe('AnnouncementsService.publish', () => {
  const make = () => {
    const prisma: any = {
      announcement: { create: jest.fn().mockResolvedValue({ id: 'n1' }) },
      notification: { createMany: jest.fn() },
      enrollment: { findMany: jest.fn().mockResolvedValue([{ userId: 'u1' }, { userId: 'u2' }]) },
      cohortMember: { findMany: jest.fn().mockResolvedValue([{ userId: 'u3' }]) },
      user: { findMany: jest.fn().mockResolvedValue([{ id: 'u1' }]) },
    };
    return { prisma, service: new AnnouncementsService(prisma) };
  };
  const base = { pinned: false, title: 'Welcome', body: 'Hi all' };

  it('notifies active enrollees for course announcements', async () => {
    const { service, prisma } = make();
    await service.publish('i1', 'INSTRUCTOR', { ...base, audience: 'COURSE', courseId: 'c1' });
    expect(prisma.notification.createMany.mock.calls[0][0].data).toHaveLength(2);
  });

  it('notifies cohort members for cohort announcements', async () => {
    const { service, prisma } = make();
    await service.publish('i1', 'INSTRUCTOR', { ...base, audience: 'COHORT', cohortId: 'k1' });
    expect(prisma.notification.createMany.mock.calls[0][0].data[0].userId).toBe('u3');
  });

  it('restricts platform-wide announcements to admins', async () => {
    const { service } = make();
    await expect(service.publish('i1', 'INSTRUCTOR', { ...base, audience: 'ALL' })).rejects.toThrow('admins');
    await expect(service.publish('a1', 'ADMIN', { ...base, audience: 'ALL' })).resolves.toBeDefined();
  });
});
