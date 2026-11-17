import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { submitAttemptSchema, SubmitAttemptInput } from '@learnsphere/shared-types';

@Controller('quizzes')
@UseGuards(JwtGuard)
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @Get(':id')
  get(@Param('id') id: string) {
    return this.quizzes.getQuiz(id);
  }

  @Post(':id/attempts')
  submit(
    @Req() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body(new ZodValidationPipe(submitAttemptSchema)) body: SubmitAttemptInput,
  ) {
    return this.quizzes.submit(req.user.sub, id, body);
  }
}
