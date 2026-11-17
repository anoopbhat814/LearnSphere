export interface CouponLike {
  type: 'PERCENT' | 'FIXED';
  amount: number;
  courseId: string | null;
  maxRedemptions: number | null;
  redeemed: number;
  expiresAt: Date | null;
}

export class CouponRejected extends Error {}

/** Validates a coupon against a course and returns the discounted price in cents (never below zero). */
export function applyCoupon(priceCents: number, courseId: string, coupon: CouponLike, now = new Date()): number {
  if (coupon.expiresAt && coupon.expiresAt.getTime() < now.getTime()) throw new CouponRejected('Coupon has expired');
  if (coupon.maxRedemptions !== null && coupon.redeemed >= coupon.maxRedemptions) throw new CouponRejected('Coupon is fully redeemed');
  if (coupon.courseId && coupon.courseId !== courseId) throw new CouponRejected('Coupon does not apply to this course');
  const discount = coupon.type === 'PERCENT' ? Math.round((priceCents * coupon.amount) / 100) : coupon.amount;
  return Math.max(priceCents - discount, 0);
}
