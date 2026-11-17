import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('enrollments')
@UseGuards(JwtGuard)
export class EnrollmentsController {
  constructor(private readonly enrollments: EnrollmentsService) {}

  @Get('me')
  mine(@Req() req: { user: { sub: string } }) {
    return this.enrollments.listForUser(req.user.sub);
  }

  @Post(':courseId')
  enroll(@Req() req: { user: { sub: string } }, @Param('courseId') courseId: string) {
    return this.enrollments.enroll(req.user.sub, courseId);
  }

  @Delete(':courseId')
  drop(@Req() req: { user: { sub: string } }, @Param('courseId') courseId: string) {
    return this.enrollments.drop(req.user.sub, courseId);
  }
}
