-- Enums
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');
CREATE TYPE "LiveSessionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELED');
CREATE TYPE "AnnouncementAudience" AS ENUM ('COURSE', 'COHORT', 'ALL');

-- Cohorts
CREATE TABLE "cohorts" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cohorts_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "cohort_members" (
    "cohortId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cohort_members_pkey" PRIMARY KEY ("cohortId", "userId")
);

-- Learning paths
CREATE TABLE "learning_paths" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "learning_path_courses" (
    "pathId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "learning_path_courses_pkey" PRIMARY KEY ("pathId", "courseId")
);

-- Badges
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "user_badges" (
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("userId", "badgeId")
);

-- Assignments
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "maxPoints" INTEGER NOT NULL DEFAULT 100,
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "graderId" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "body" TEXT,
    "attachmentUrl" TEXT,
    "score" INTEGER,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- Bookmarks and notes
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "atSecond" INTEGER NOT NULL DEFAULT 0,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- Commerce
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "courseId" TEXT,
    "maxRedemptions" INTEGER,
    "redeemed" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "couponId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Live sessions and announcements
CREATE TABLE "live_sessions" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "cohortId" TEXT,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "LiveSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "joinUrl" TEXT,
    "recordingAssetId" TEXT,
    CONSTRAINT "live_sessions_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "audience" "AnnouncementAudience" NOT NULL DEFAULT 'COURSE',
    "courseId" TEXT,
    "cohortId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "cohorts_courseId_name_key" ON "cohorts"("courseId", "name");
CREATE INDEX "cohorts_startsAt_idx" ON "cohorts"("startsAt");
CREATE INDEX "cohort_members_userId_idx" ON "cohort_members"("userId");
CREATE UNIQUE INDEX "learning_paths_slug_key" ON "learning_paths"("slug");
CREATE UNIQUE INDEX "learning_path_courses_pathId_position_key" ON "learning_path_courses"("pathId", "position");
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");
CREATE INDEX "assignments_courseId_dueAt_idx" ON "assignments"("courseId", "dueAt");
CREATE UNIQUE INDEX "submissions_assignmentId_userId_key" ON "submissions"("assignmentId", "userId");
CREATE INDEX "submissions_status_idx" ON "submissions"("status");
CREATE UNIQUE INDEX "bookmarks_userId_courseId_lessonId_key" ON "bookmarks"("userId", "courseId", "lessonId");
CREATE INDEX "bookmarks_userId_createdAt_idx" ON "bookmarks"("userId", "createdAt");
CREATE INDEX "notes_userId_lessonId_idx" ON "notes"("userId", "lessonId");
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");
CREATE UNIQUE INDEX "payments_providerRef_key" ON "payments"("providerRef");
CREATE INDEX "payments_userId_status_idx" ON "payments"("userId", "status");
CREATE INDEX "payments_courseId_idx" ON "payments"("courseId");
CREATE INDEX "live_sessions_courseId_startsAt_idx" ON "live_sessions"("courseId", "startsAt");
CREATE INDEX "announcements_courseId_publishedAt_idx" ON "announcements"("courseId", "publishedAt");

-- Foreign keys
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cohort_members" ADD CONSTRAINT "cohort_members_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cohort_members" ADD CONSTRAINT "cohort_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_path_courses" ADD CONSTRAINT "learning_path_courses_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_path_courses" ADD CONSTRAINT "learning_path_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_graderId_fkey" FOREIGN KEY ("graderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
