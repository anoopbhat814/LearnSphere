import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { LiveSessionsService } from './live-sessions.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles, RolesGuard } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { scheduleSessionSchema, transitionSchema, ScheduleSessionInput, TransitionInput } from './live-sessions.dto';

type Req_ = { user: { sub: string; role: string } };

@Controller('live-sessions')
export class LiveSessionsController {
  constructor(private readonly sessions: LiveSessionsService) {}

  @Get('courses/:courseId')
  upcoming(@Param('courseId') courseId: string) {
    return this.sessions.upcoming(courseId);
  }

  @Post('courses/:courseId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  schedule(@Req() req: Req_, @Param('courseId') courseId: string, @Body(new ZodValidationPipe(scheduleSessionSchema)) body: ScheduleSessionInput) {
    return this.sessions.schedule(req.user.sub, courseId, body);
  }

  @Patch(':id/status')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  transition(@Req() req: Req_, @Param('id') id: string, @Body(new ZodValidationPipe(transitionSchema)) body: TransitionInput) {
    return this.sessions.transition(req.user.sub, req.user.role, id, body);
  }
}
