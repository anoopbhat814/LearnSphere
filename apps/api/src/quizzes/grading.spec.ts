import { gradeAttempt } from './grading';

const questions = [
  { id: 'q1', points: 2, explanation: null, options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }] },
  { id: 'q2', points: 2, explanation: 'Because', options: [{ id: 'c', isCorrect: true }, { id: 'd', isCorrect: true }] },
];

describe('gradeAttempt', () => {
  it('scores 100 when all answers match', () => {
    const r = gradeAttempt(questions, { answers: [{ questionId: 'q1', optionIds: ['a'] }, { questionId: 'q2', optionIds: ['c', 'd'] }] });
    expect(r.score).toBe(100);
  });

  it('gives no credit for partially correct multi-select', () => {
    const r = gradeAttempt(questions, { answers: [{ questionId: 'q1', optionIds: ['a'] }, { questionId: 'q2', optionIds: ['c'] }] });
    expect(r.score).toBe(50);
    expect(r.perQuestion[1]).toMatchObject({ correct: false, explanation: 'Because' });
  });
});
