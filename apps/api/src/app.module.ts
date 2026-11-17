import { Module } from '@nestjs/common';
import { PrismaService } from './common/prisma.service';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ProgressModule } from './progress/progress.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ForumModule } from './forum/forum.module';
import { RecommendationsModule } from './recommendations/recommendations.module';

@Module({
  imports: [
    AuthModule,
    CoursesModule,
    LessonsModule,
    QuizzesModule,
    EnrollmentsModule,
    ProgressModule,
    CertificatesModule,
    ForumModule,
    RecommendationsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
