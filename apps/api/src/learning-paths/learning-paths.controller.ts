import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles, RolesGuard } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { createPathSchema, CreatePathInput } from './learning-paths.dto';

type Req_ = { user: { sub: string } };

@Controller('learning-paths')
export class LearningPathsController {
  constructor(private readonly paths: LearningPathsService) {}

  @Get()
  list() {
    return this.paths.list();
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.paths.get(slug);
  }

  @Get(':slug/progress')
  @UseGuards(JwtGuard)
  progress(@Req() req: Req_, @Param('slug') slug: string) {
    return this.paths.progress(req.user.sub, slug);
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body(new ZodValidationPipe(createPathSchema)) body: CreatePathInput) {
    return this.paths.create(body);
  }
}
