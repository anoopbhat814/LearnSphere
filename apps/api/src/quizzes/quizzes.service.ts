import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { gradeAttempt } from './grading';
import { AttemptResultDto, QuizDto, SubmitAttemptInput } from '@learnsphere/shared-types';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuiz(quizId: string): Promise<QuizDto> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { include: { options: true } } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return {
      id: quiz.id,
      lessonId: quiz.lessonId,
      passingScore: quiz.passingScore,
      timeLimitSec: quiz.timeLimitSec,
      questions: quiz.questions.map((q) => ({
        id: q.id, prompt: q.prompt, type: q.type, points: q.points,
        options: q.options.map((o) => ({ id: o.id, text: o.text })), // never leak isCorrect
      })),
    };
  }

  async submit(userId: string, quizId: string, input: SubmitAttemptInput): Promise<AttemptResultDto> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { include: { options: true } } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    const outcome = gradeAttempt(quiz.questions, input);
    const passed = outcome.score >= quiz.passingScore;
    const attempt = await this.prisma.quizAttempt.create({
      data: { quizId, userId, score: outcome.score, passed, answers: input.answers as object[], submittedAt: new Date() },
    });
    return { attemptId: attempt.id, score: outcome.score, passed, perQuestion: outcome.perQuestion };
  }
}
