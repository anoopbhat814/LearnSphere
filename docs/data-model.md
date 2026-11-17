# Data model

Core entities (see `prisma/schema.prisma`):

- **User** has a role (`STUDENT`, `INSTRUCTOR`, `ADMIN`); instructors own an `InstructorProfile`.
- **Course** contains ordered **Modules**, each containing ordered **Lessons**.
- A **Lesson** of type `QUIZ` owns a **Quiz** with **Questions** and **Options**.
- **Enrollment** links a user to a course; **LessonProgress** tracks per-lesson watch time.
- **Certificate** is unique per user and course and carries a public verification code.
- **ForumThread**, **ForumPost** and **PostVote** implement threaded course discussions.
