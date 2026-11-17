import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CohortsService } from './cohorts.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles, RolesGuard } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { createCohortSchema, CreateCohortInput } from './cohorts.dto';

type Req_ = { user: { sub: string } };

@Controller('cohorts')
export class CohortsController {
  constructor(private readonly cohorts: CohortsService) {}

  @Get('courses/:courseId')
  upcoming(@Param('courseId') courseId: string) {
    return this.cohorts.listUpcoming(courseId);
  }

  @Post('courses/:courseId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  create(@Param('courseId') courseId: string, @Body(new ZodValidationPipe(createCohortSchema)) body: CreateCohortInput) {
    return this.cohorts.create(courseId, body);
  }

  @Post(':id/join')
  @UseGuards(JwtGuard)
  join(@Req() req: Req_, @Param('id') id: string) {
    return this.cohorts.join(req.user.sub, id);
  }

  @Delete(':id/membership')
  @UseGuards(JwtGuard)
  leave(@Req() req: Req_, @Param('id') id: string) {
    return this.cohorts.leave(req.user.sub, id);
  }
}
