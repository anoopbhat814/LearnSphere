import { SubmitAttemptInput } from '@learnsphere/shared-types';

export interface GradableQuestion {
  id: string;
  points: number;
  explanation: string | null;
  options: { id: string; isCorrect: boolean }[];
}

export interface GradeOutcome {
  score: number;
  perQuestion: { questionId: string; correct: boolean; explanation?: string }[];
}

/** Awards full points only when the selected set exactly equals the correct set. */
export function gradeAttempt(questions: GradableQuestion[], input: SubmitAttemptInput): GradeOutcome {
  const byId = new Map(input.answers.map((a) => [a.questionId, a]));
  let earned = 0;
  let possible = 0;
  const perQuestion = questions.map((q) => {
    possible += q.points;
    const given = new Set(byId.get(q.id)?.optionIds ?? []);
    const correct = new Set(q.options.filter((o) => o.isCorrect).map((o) => o.id));
    const isCorrect = given.size === correct.size && [...correct].every((id) => given.has(id));
    if (isCorrect) earned += q.points;
    return { questionId: q.id, correct: isCorrect, explanation: q.explanation ?? undefined };
  });
  return { score: possible === 0 ? 0 : Math.round((earned / possible) * 100), perQuestion };
}
