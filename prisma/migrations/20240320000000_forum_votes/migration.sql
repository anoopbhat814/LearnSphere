CREATE TABLE "ForumThread" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PostVote" (
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "PostVote_pkey" PRIMARY KEY ("postId", "userId")
);

CREATE INDEX "ForumThread_courseId_createdAt_idx" ON "ForumThread"("courseId", "createdAt");
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_threadId_fkey"
  FOREIGN KEY ("threadId") REFERENCES "ForumThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "ForumPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PostVote" ADD CONSTRAINT "PostVote_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
