import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('progress')
@UseGuards(JwtGuard)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get('courses/:courseId')
  course(@Req() req: { user: { sub: string } }, @Param('courseId') courseId: string) {
    return this.progress.courseProgress(req.user.sub, courseId);
  }

  @Put('lessons/:lessonId')
  record(
    @Req() req: { user: { sub: string } },
    @Param('lessonId') lessonId: string,
    @Body() body: { watchedSec: number; completed?: boolean },
  ) {
    return this.progress.recordLesson(req.user.sub, lessonId, body.watchedSec, !!body.completed);
  }
}
