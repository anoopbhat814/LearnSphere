# Data model

Core entities (see `prisma/schema.prisma`):

- **User** has a role (`STUDENT`, `INSTRUCTOR`, `ADMIN`); instructors own an `InstructorProfile`.
- **Course** contains ordered **Modules**, each containing ordered **Lessons**.
- A **Lesson** of type `QUIZ` owns a **Quiz** with **Questions** and **Options**.
- **Enrollment** links a user to a course; **LessonProgress** tracks per-lesson watch time.
- **Certificate** is unique per user and course and carries a public verification code.
- **ForumThread**, **ForumPost** and **PostVote** implement threaded course discussions.
- **Cohort** groups learners on a course with a start date and optional capacity (**CohortMember**); **LearningPath** orders several courses (**LearningPathCourse**).
- **Assignment** belongs to a course (optionally a lesson); each learner has one **Submission** that moves `DRAFT` -> `SUBMITTED` -> `GRADED`/`RETURNED`.
- **Note** (timestamped, per lesson) and **Bookmark** (course or lesson) are private study aids.
- **Badge** / **UserBadge** record achievements, awarded by rules in the API's `badges` module.
- **Coupon** (`PERCENT` or `FIXED`) is applied at checkout; **Payment** tracks status and enrols the buyer once `SUCCEEDED`.
- **LiveSession** (`SCHEDULED` -> `LIVE` -> `ENDED`, or `CANCELED`) and **Announcement** (course, cohort or platform-wide audience) support live teaching; announcements fan out as `Notification` rows.
- Tables added after the initial schema use snake_case `@@map` names (for example `live_sessions`).
