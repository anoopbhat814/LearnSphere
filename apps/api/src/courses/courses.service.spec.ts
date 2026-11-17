import { CoursesService } from './courses.service';

describe('CoursesService', () => {
  const prisma: any = {
    $transaction: jest.fn().mockResolvedValue([[], 0]),
    course: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn().mockResolvedValue(null) },
  };
  const service = new CoursesService(prisma);

  it('caps page size at 50', async () => {
    const result = await service.list({ pageSize: 500 });
    expect(result.pageSize).toBe(50);
  });

  it('throws when a course slug does not exist', async () => {
    await expect(service.findBySlug('missing')).rejects.toThrow('not found');
  });
});
