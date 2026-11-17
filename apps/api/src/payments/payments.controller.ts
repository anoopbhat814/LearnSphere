import { Body, Controller, Get, Headers, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles, RolesGuard } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  checkoutSchema, createCouponSchema, providerEventSchema,
  CheckoutInput, CreateCouponInput, ProviderEventInput,
} from './payments.dto';

type Req_ = { user: { sub: string } };

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('checkout')
  @UseGuards(JwtGuard)
  checkout(@Req() req: Req_, @Body(new ZodValidationPipe(checkoutSchema)) body: CheckoutInput) {
    return this.payments.checkout(req.user.sub, body);
  }

  @Get('history')
  @UseGuards(JwtGuard)
  history(@Req() req: Req_) {
    return this.payments.history(req.user.sub);
  }

  @Post('coupons')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  createCoupon(@Body(new ZodValidationPipe(createCouponSchema)) body: CreateCouponInput) {
    return this.payments.createCoupon(body);
  }

  @Post('provider-events')
  providerEvent(@Headers('x-provider-secret') secret: string | undefined, @Body(new ZodValidationPipe(providerEventSchema)) body: ProviderEventInput) {
    if (!process.env.PAYMENT_WEBHOOK_SECRET || secret !== process.env.PAYMENT_WEBHOOK_SECRET) {
      throw new UnauthorizedException('Bad webhook secret');
    }
    return this.payments.handleProviderEvent(body);
  }
}
