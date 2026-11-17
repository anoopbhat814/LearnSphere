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
import { AssignmentsModule } from './assignments/assignments.module';
import { PaymentsModule } from './payments/payments.module';
import { CohortsModule } from './cohorts/cohorts.module';
import { LearningPathsModule } from './learning-paths/learning-paths.module';
import { LiveSessionsModule } from './live-sessions/live-sessions.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { StudyModule } from './study/study.module';
import { BadgesModule } from './badges/badges.module';

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
    AssignmentsModule,
    PaymentsModule,
    CohortsModule,
    LearningPathsModule,
    LiveSessionsModule,
    AnnouncementsModule,
    StudyModule,
    BadgesModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
