import { applyCoupon, CouponLike, CouponRejected } from './pricing';

const base: CouponLike = { type: 'PERCENT', amount: 20, courseId: null, maxRedemptions: null, redeemed: 0, expiresAt: null };

describe('applyCoupon', () => {
  it.each([
    ['percent', { ...base }, 4900, 3920],
    ['fixed', { ...base, type: 'FIXED' as const, amount: 1000 }, 4900, 3900],
    ['fixed larger than price', { ...base, type: 'FIXED' as const, amount: 9999 }, 4900, 0],
    ['100 percent', { ...base, amount: 100 }, 4900, 0],
  ])('%s discount', (_name, coupon, price, expected) => {
    expect(applyCoupon(price, 'c1', coupon)).toBe(expected);
  });

  it.each([
    ['expired', { ...base, expiresAt: new Date('2020-01-01') }, 'expired'],
    ['exhausted', { ...base, maxRedemptions: 5, redeemed: 5 }, 'redeemed'],
    ['wrong course', { ...base, courseId: 'other' }, 'does not apply'],
  ])('rejects %s coupons', (_name, coupon, message) => {
    expect(() => applyCoupon(4900, 'c1', coupon)).toThrow(CouponRejected);
    expect(() => applyCoupon(4900, 'c1', coupon)).toThrow(message);
  });
});
