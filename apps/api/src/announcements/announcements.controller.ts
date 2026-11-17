import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles, RolesGuard } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { createAnnouncementSchema, CreateAnnouncementInput } from './announcements.dto';

type Req_ = { user: { sub: string; role: string } };

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcements: AnnouncementsService) {}

  @Get('courses/:courseId')
  feed(@Param('courseId') courseId: string, @Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.announcements.feed(courseId, limit);
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  publish(@Req() req: Req_, @Body(new ZodValidationPipe(createAnnouncementSchema)) body: CreateAnnouncementInput) {
    return this.announcements.publish(req.user.sub, req.user.role, body);
  }
}
