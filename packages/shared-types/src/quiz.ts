import { z } from 'zod';

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export interface OptionDto {
  id: string;
  text: string;
}

export interface QuestionDto {
  id: string;
  prompt: string;
  type: QuestionType;
  points: number;
  options: OptionDto[];
}

export interface QuizDto {
  id: string;
  lessonId: string;
  passingScore: number;
  timeLimitSec?: number | null;
  questions: QuestionDto[];
}

export const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      optionIds: z.array(z.string()).default([]),
      text: z.string().optional(),
    }),
  ),
});

export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;

export interface AttemptResultDto {
  attemptId: string;
  score: number;
  passed: boolean;
  perQuestion: { questionId: string; correct: boolean; explanation?: string }[];
}
