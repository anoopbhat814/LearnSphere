import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles, RolesGuard } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { createBadgeSchema, CreateBadgeInput } from './badges.dto';

type Req_ = { user: { sub: string } };

@Controller('badges')
export class BadgesController {
  constructor(private readonly badges: BadgesService) {}

  @Get('mine')
  @UseGuards(JwtGuard)
  mine(@Req() req: Req_) {
    return this.badges.forUser(req.user.sub);
  }

  @Post('evaluate')
  @UseGuards(JwtGuard)
  async evaluate(@Req() req: Req_) {
    return { awarded: await this.badges.evaluate(req.user.sub) };
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body(new ZodValidationPipe(createBadgeSchema)) body: CreateBadgeInput) {
    return this.badges.create(body);
  }
}
