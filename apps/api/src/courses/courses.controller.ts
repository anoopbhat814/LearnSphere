import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles, RolesGuard } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CourseLevel, createCourseSchema, CreateCourseInput } from '@learnsphere/shared-types';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('level') level?: CourseLevel,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
  ) {
    return this.courses.list({ search, level, categoryId, page: page ? Number(page) : 1 });
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.courses.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  create(@Req() req: { user: { instructorId: string } }, @Body(new ZodValidationPipe(createCourseSchema)) body: CreateCourseInput) {
    return this.courses.create(req.user.instructorId, body);
  }
}
