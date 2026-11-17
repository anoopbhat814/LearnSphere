import { PrismaClient, Role, DiscountType, CourseLevel, CourseStatus, LessonType, QuestionType } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hash(password: string): string {
  const salt = crypto.randomBytes(8).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 32).toString('hex')}`;
}

async function main() {
  const categories = await Promise.all(
    [
      ['web-development', 'Web Development'],
      ['data-science', 'Data Science'],
      ['design', 'Design'],
    ].map(([slug, name]) =>
      prisma.category.upsert({ where: { slug }, update: {}, create: { slug, name } }),
    ),
  );

  const instructorUser = await prisma.user.upsert({
    where: { email: 'ada@learnsphere.dev' },
    update: {},
    create: {
      email: 'ada@learnsphere.dev',
      passwordHash: hash('instructor-demo'),
      displayName: 'Ada Whitfield',
      role: Role.INSTRUCTOR,
      instructor: { create: { headline: 'Staff engineer and educator', verified: true } },
    },
    include: { instructor: true },
  });

  const student = await prisma.user.upsert({
    where: { email: 'sam@learnsphere.dev' },
    update: {},
    create: { email: 'sam@learnsphere.dev', passwordHash: hash('student-demo'), displayName: 'Sam Rivera' },
  });

  const course = await prisma.course.upsert({
    where: { slug: 'typescript-fundamentals' },
    update: {},
    create: {
      slug: 'typescript-fundamentals',
      title: 'TypeScript Fundamentals',
      summary: 'Learn static typing, generics and modern tooling.',
      description: 'A hands-on course covering the TypeScript type system from basics to advanced patterns.',
      level: CourseLevel.BEGINNER,
      status: CourseStatus.PUBLISHED,
      priceCents: 4900,
      publishedAt: new Date(),
      instructorId: instructorUser.instructor!.id,
      categoryId: categories[0].id,
      modules: {
        create: [
          {
            title: 'Getting Started',
            position: 1,
            lessons: {
              create: [
                { title: 'Why TypeScript?', type: LessonType.VIDEO, position: 1, durationSeconds: 540 },
                {
                  title: 'Basic Types Quiz',
                  type: LessonType.QUIZ,
                  position: 2,
                  quiz: {
                    create: {
                      passingScore: 60,
                      questions: {
                        create: [
                          {
                            prompt: 'Which keyword declares a type alias?',
                            type: QuestionType.SINGLE_CHOICE,
                            options: {
                              create: [
                                { text: 'type', isCorrect: true },
                                { text: 'alias', isCorrect: false },
                                { text: 'typedef', isCorrect: false },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: { userId: student.id, courseId: course.id },
  });
  const badges = [
    ['first_course', 'First Course', 'Completed your first course'],
    ['course_collector', 'Course Collector', 'Completed five courses'],
    ['quiz_whiz', 'Quiz Whiz', 'Passed ten quizzes'],
    ['hands_on', 'Hands-on', 'Had three assignments graded'],
  ];
  for (const [code, name, description] of badges) {
    await prisma.badge.upsert({ where: { code }, update: {}, create: { code, name, description } });
  }

  await prisma.coupon.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: { code: 'WELCOME20', type: DiscountType.PERCENT, amount: 20, maxRedemptions: 500 },
  });

  await prisma.learningPath.upsert({
    where: { slug: 'frontend-foundations' },
    update: {},
    create: {
      slug: 'frontend-foundations',
      title: 'Frontend Foundations',
      description: 'A guided route from typed JavaScript to production web apps.',
      published: true,
      courses: { create: [{ courseId: course.id, position: 1 }] },
    },
  });

  const startsAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  await prisma.cohort.upsert({
    where: { courseId_name: { courseId: course.id, name: 'Spring Cohort' } },
    update: {},
    create: { courseId: course.id, name: 'Spring Cohort', startsAt, capacity: 40 },
  });

  const lesson = await prisma.lesson.findFirst({ where: { module: { courseId: course.id } }, orderBy: { position: 'asc' } });
  await prisma.assignment.create({
    data: {
      courseId: course.id,
      lessonId: lesson?.id,
      title: 'Typed utility library',
      instructions: 'Write three generic helper functions and document their type signatures.',
      dueAt: new Date(startsAt.getTime() + 14 * 24 * 3600 * 1000),
    },
  }).catch(() => undefined);

  console.log('Seeded course', course.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
