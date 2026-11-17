import { createPathSchema } from './learning-paths.dto';
import { LearningPathsService, summarisePath } from './learning-paths.service';

describe('summarisePath', () => {
  it.each([
    [[], [], 0, null],
    [['a', 'b', 'c', 'd'], [], 0, 'a'],
    [['a', 'b', 'c', 'd'], ['a', 'b'], 50, 'c'],
    [['a', 'b', 'c'], ['a', 'c'], 67, 'b'],
    [['a', 'b'], ['a', 'b'], 100, null],
  ])('%j with %j done', (order, done, percent, next) => {
    const result = summarisePath('p', order as string[], new Set(done as string[]));
    expect(result.percent).toBe(percent);
    expect(result.nextCourseId).toBe(next);
  });
});

describe('createPathSchema', () => {
  const valid = { slug: 'fullstack', title: 'Full-stack', description: 'From HTML to deploy.', courseIds: ['a', 'b'] };
  it('applies defaults', () => expect(createPathSchema.parse(valid).published).toBe(false));
  it('rejects duplicate courses and bad slugs', () => {
    expect(createPathSchema.safeParse({ ...valid, courseIds: ['a', 'a'] }).success).toBe(false);
    expect(createPathSchema.safeParse({ ...valid, slug: 'Bad Slug' }).success).toBe(false);
  });
});

describe('LearningPathsService.create', () => {
  it('numbers courses from one in the given order', async () => {
    const create = jest.fn().mockResolvedValue({});
    await new LearningPathsService({ learningPath: { create } } as any).create({
      slug: 'x-path', title: 'X path', description: 'long enough text', published: true, courseIds: ['c9', 'c3'],
    });
    expect(create.mock.calls[0][0].data.courses.create).toEqual([
      { courseId: 'c9', position: 1 },
      { courseId: 'c3', position: 2 },
    ]);
  });
});
