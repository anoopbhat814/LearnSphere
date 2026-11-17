import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('lessons')
@UseGuards(JwtGuard)
export class LessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Get(':id')
  get(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.lessons.getForLearner(req.user.sub, id);
  }

  @Get(':id/next')
  next(@Param('id') id: string) {
    return this.lessons.nextLesson(id);
  }
}
