import { formatTimestamp, StudyService } from './study.service';

describe('formatTimestamp', () => {
  it.each([[0, '0:00'], [65, '1:05'], [3599, '59:59'], [3600, '1:00:00'], [7384, '2:03:04']])('%i -> %s', (sec, out) => {
    expect(formatTimestamp(sec)).toBe(out);
  });
});

describe('StudyService', () => {
  const make = () => {
    const prisma: any = {
      note: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn() },
      bookmark: { findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() },
    };
    return { prisma, service: new StudyService(prisma) };
  };

  it('prevents editing someone else\'s note', async () => {
    const { service, prisma } = make();
    prisma.note.findUnique.mockResolvedValue({ id: 'n1', userId: 'other' });
    await expect(service.updateNote('u1', 'n1', { body: 'x' })).rejects.toThrow('Not your note');
    expect(prisma.note.update).not.toHaveBeenCalled();
  });

  it('reports a missing note', async () => {
    const { service, prisma } = make();
    prisma.note.findUnique.mockResolvedValue(null);
    await expect(service.deleteNote('u1', 'nope')).rejects.toThrow('not found');
  });

  it('toggles bookmarks on and off', async () => {
    const { service, prisma } = make();
    prisma.bookmark.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'b1' });
    expect(await service.toggleBookmark('u1', { courseId: 'c1' })).toEqual({ bookmarked: true });
    expect(await service.toggleBookmark('u1', { courseId: 'c1' })).toEqual({ bookmarked: false });
    expect(prisma.bookmark.delete).toHaveBeenCalledWith({ where: { id: 'b1' } });
  });

  it('exports notes as a markdown list with timestamps', async () => {
    const { service, prisma } = make();
    prisma.note.findMany.mockResolvedValue([{ atSecond: 5, body: 'intro' }, { atSecond: 3725, body: 'line\n\nbreak' }]);
    expect(await service.exportMarkdown('u1', 'l1')).toBe('- [0:05] intro\n- [1:02:05] line break');
  });
});
