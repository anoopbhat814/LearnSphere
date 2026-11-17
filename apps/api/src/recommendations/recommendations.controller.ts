import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('recommendations')
@UseGuards(JwtGuard)
export class RecommendationsController {
  constructor(private readonly recs: RecommendationsService) {}

  @Get()
  mine(@Req() req: { user: { sub: string } }, @Query('limit') limit?: string) {
    return this.recs.forUser(req.user.sub, limit ? Math.min(Number(limit), 20) : 8);
  }
}
