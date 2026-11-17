import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CheckoutInput, CreateCouponInput, ProviderEventInput } from './payments.dto';
import { applyCoupon, CouponRejected } from './pricing';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  createCoupon(input: CreateCouponInput) {
    return this.prisma.coupon.create({ data: input });
  }

  async checkout(userId: string, input: CheckoutInput) {
    const course = await this.prisma.course.findUnique({ where: { id: input.courseId } });
    if (!course || course.status !== 'PUBLISHED') throw new NotFoundException('Course not available');
    const already = await this.prisma.payment.findFirst({ where: { userId, courseId: course.id, status: 'SUCCEEDED' } });
    if (already) throw new ConflictException('Course already purchased');

    let amountCents = course.priceCents;
    let couponId: string | undefined;
    if (input.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: input.couponCode } });
      if (!coupon) throw new BadRequestException('Unknown coupon');
      try {
        amountCents = applyCoupon(course.priceCents, course.id, coupon);
      } catch (e) {
        if (e instanceof CouponRejected) throw new BadRequestException(e.message);
        throw e;
      }
      couponId = coupon.id;
    }
    return this.prisma.payment.create({
      data: { userId, courseId: course.id, couponId, amountCents, status: amountCents === 0 ? 'SUCCEEDED' : 'PENDING', paidAt: amountCents === 0 ? new Date() : null },
    });
  }

  /** Applies a payment-provider callback; success enrols the buyer and counts the coupon redemption atomically. */
  async handleProviderEvent(event: ProviderEventInput) {
    const payment = await this.prisma.payment.findUnique({ where: { providerRef: event.providerRef } });
    if (!payment) throw new NotFoundException('Unknown payment reference');
    if (payment.status === event.status) return payment;

    const updates: any[] = [
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: event.status, paidAt: event.status === 'SUCCEEDED' ? new Date() : payment.paidAt },
      }),
    ];
    if (event.status === 'SUCCEEDED') {
      updates.push(this.prisma.enrollment.upsert({
        where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
        create: { userId: payment.userId, courseId: payment.courseId },
        update: { status: 'ACTIVE' },
      }));
      if (payment.couponId) updates.push(this.prisma.coupon.update({ where: { id: payment.couponId }, data: { redeemed: { increment: 1 } } }));
    }
    const [updated] = await this.prisma.$transaction(updates);
    return updated;
  }

  history(userId: string) {
    return this.prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { course: { select: { title: true, slug: true } } } });
  }
}
