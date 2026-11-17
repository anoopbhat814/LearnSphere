import { PrismaClient, Role, CourseLevel, CourseStatus, LessonType, QuestionType } from '@prisma/client';
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
  console.log('Seeded course', course.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
