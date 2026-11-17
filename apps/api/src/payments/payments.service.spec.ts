import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const course = { id: 'c1', status: 'PUBLISHED', priceCents: 5000 };
  const make = () => {
    const prisma: any = {
      course: { findUnique: jest.fn().mockResolvedValue(course) },
      payment: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn(),
        create: jest.fn().mockImplementation(async ({ data }) => data),
        update: jest.fn().mockResolvedValue({ id: 'p1', status: 'SUCCEEDED' }),
      },
      coupon: { findUnique: jest.fn(), update: jest.fn() },
      enrollment: { upsert: jest.fn() },
      $transaction: jest.fn().mockImplementation(async (ops: unknown[]) => Promise.all(ops)),
    };
    return { prisma, service: new PaymentsService(prisma) };
  };

  it('creates a pending payment at list price', async () => {
    const { service } = make();
    expect(await service.checkout('u1', { courseId: 'c1' })).toMatchObject({ amountCents: 5000, status: 'PENDING' });
  });

  it('completes free checkouts immediately with a 100% coupon', async () => {
    const { service, prisma } = make();
    prisma.coupon.findUnique.mockResolvedValue({ id: 'k1', type: 'PERCENT', amount: 100, courseId: null, maxRedemptions: null, redeemed: 0, expiresAt: null });
    expect(await service.checkout('u1', { courseId: 'c1', couponCode: 'FREE' })).toMatchObject({ amountCents: 0, status: 'SUCCEEDED' });
  });

  it('rejects duplicate purchases and unknown coupons', async () => {
    const { service, prisma } = make();
    prisma.coupon.findUnique.mockResolvedValue(null);
    await expect(service.checkout('u1', { courseId: 'c1', couponCode: 'NOPE' })).rejects.toThrow('Unknown coupon');
    prisma.payment.findFirst.mockResolvedValue({ id: 'old' });
    await expect(service.checkout('u1', { courseId: 'c1' })).rejects.toThrow('already purchased');
  });

  it('enrols the buyer and counts redemption on provider success', async () => {
    const { service, prisma } = make();
    prisma.payment.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1', courseId: 'c1', couponId: 'k1', status: 'PENDING', paidAt: null });
    await service.handleProviderEvent({ providerRef: 'ch_1', status: 'SUCCEEDED' });
    expect(prisma.enrollment.upsert).toHaveBeenCalled();
    expect(prisma.coupon.update).toHaveBeenCalledWith({ where: { id: 'k1' }, data: { redeemed: { increment: 1 } } });
  });

  it('is idempotent for repeated provider events', async () => {
    const { service, prisma } = make();
    prisma.payment.findUnique.mockResolvedValue({ id: 'p1', status: 'SUCCEEDED' });
    await service.handleProviderEvent({ providerRef: 'ch_1', status: 'SUCCEEDED' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
