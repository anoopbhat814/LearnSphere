import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles, RolesGuard } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  createAssignmentSchema, gradeSchema, submitSchema,
  CreateAssignmentInput, GradeInput, SubmitInput,
} from './assignments.dto';

type Req_ = { user: { sub: string } };

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignments: AssignmentsService) {}

  @Get('courses/:courseId')
  list(@Param('courseId') courseId: string) {
    return this.assignments.listForCourse(courseId);
  }

  @Post('courses/:courseId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  create(@Param('courseId') courseId: string, @Body(new ZodValidationPipe(createAssignmentSchema)) body: CreateAssignmentInput) {
    return this.assignments.create(courseId, body);
  }

  @Post(':id/submissions')
  @UseGuards(JwtGuard)
  submit(
    @Req() req: Req_, @Param('id') id: string, @Query('draft') draft: string | undefined,
    @Body(new ZodValidationPipe(submitSchema)) body: SubmitInput,
  ) {
    return this.assignments.submit(req.user.sub, id, body, draft === 'true');
  }

  @Get(':id/queue')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  queue(@Param('id') id: string) {
    return this.assignments.queue(id);
  }

  @Post('submissions/:id/grade')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  grade(@Req() req: Req_, @Param('id') id: string, @Body(new ZodValidationPipe(gradeSchema)) body: GradeInput) {
    return this.assignments.grade(req.user.sub, id, body);
  }
}
