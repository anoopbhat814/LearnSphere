import { z } from 'zod';

export const checkoutSchema = z.object({
  courseId: z.string().min(1),
  couponCode: z.string().trim().toUpperCase().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const createCouponSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{4,24}$/),
  type: z.enum(['PERCENT', 'FIXED']),
  amount: z.number().int().positive(),
  courseId: z.string().optional(),
  maxRedemptions: z.number().int().positive().optional(),
  expiresAt: z.coerce.date().optional(),
}).refine((c) => c.type !== 'PERCENT' || c.amount <= 100, { message: 'percent coupons cannot exceed 100', path: ['amount'] });
export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export const providerEventSchema = z.object({
  providerRef: z.string(),
  status: z.enum(['SUCCEEDED', 'FAILED', 'REFUNDED']),
});
export type ProviderEventInput = z.infer<typeof providerEventSchema>;
