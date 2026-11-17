# API reference (excerpt)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Obtain access and refresh tokens |
| GET | `/api/courses` | Paginated catalogue with `search`, `level`, `categoryId` |
| GET | `/api/courses/:slug` | Course detail with curriculum |
| POST | `/api/enrollments/:courseId` | Enroll the current user |
| PUT | `/api/progress/lessons/:lessonId` | Record watch position / completion |
| POST | `/api/quizzes/:id/attempts` | Submit quiz answers |
| POST | `/api/certificates/:courseId` | Issue a certificate for a completed course |
| GET | `/api/certificates/verify/:code` | Public certificate verification |
| GET | `/api/recommendations` | Personalised course suggestions |
