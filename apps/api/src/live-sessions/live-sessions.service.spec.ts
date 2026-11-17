import { canTransition, LiveSessionsService } from './live-sessions.service';

describe('canTransition', () => {
  it.each([
    ['SCHEDULED', 'LIVE', true],
    ['SCHEDULED', 'ENDED', false],
    ['LIVE', 'ENDED', true],
    ['LIVE', 'CANCELED', false],
    ['ENDED', 'LIVE', false],
  ] as const)('%s -> %s = %s', (from, to, ok) => expect(canTransition(from, to)).toBe(ok));
});

describe('LiveSessionsService.transition', () => {
  const make = (session: any) => {
    const prisma: any = { liveSession: { findUnique: jest.fn().mockResolvedValue(session), update: jest.fn().mockResolvedValue({}) } };
    return { prisma, service: new LiveSessionsService(prisma) };
  };

  it('only lets the host or an admin change status', async () => {
    const { service } = make({ hostId: 'h1', status: 'SCHEDULED' });
    await expect(service.transition('other', 'INSTRUCTOR', 's1', { status: 'LIVE' })).rejects.toThrow('host');
    await expect(service.transition('other', 'ADMIN', 's1', { status: 'LIVE' })).resolves.toBeDefined();
  });

  it('stores the recording only when the session ends', async () => {
    const { service, prisma } = make({ hostId: 'h1', status: 'LIVE' });
    await service.transition('h1', 'INSTRUCTOR', 's1', { status: 'ENDED', recordingAssetId: 'asset-9' });
    expect(prisma.liveSession.update.mock.calls[0][0].data).toEqual({ status: 'ENDED', recordingAssetId: 'asset-9' });
  });

  it('rejects illegal transitions and unknown sessions', async () => {
    await expect(make({ hostId: 'h1', status: 'ENDED' }).service.transition('h1', 'INSTRUCTOR', 's1', { status: 'LIVE' })).rejects.toThrow('Cannot move');
    await expect(make(null).service.transition('h1', 'INSTRUCTOR', 's1', { status: 'LIVE' })).rejects.toThrow('not found');
  });
});
