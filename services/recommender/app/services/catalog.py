from typing import Dict, Iterable, List

from app.models.course import Course


class CatalogStore:
    """In-memory course catalogue; production deployments sync this from the API."""

    def __init__(self, courses: Iterable[Course]):
        self.courses: Dict[str, Course] = {c.id: c for c in courses}
        # user_id -> set of enrolled course ids, used for collaborative filtering
        self.enrollments: Dict[str, set] = {}

    def record_enrollment(self, user_id: str, course_id: str) -> None:
        self.enrollments.setdefault(user_id, set()).add(course_id)

    def all(self) -> List[Course]:
        return list(self.courses.values())

    @classmethod
    def with_sample_data(cls) -> "CatalogStore":
        store = cls(
            [
                Course("c1", "TypeScript Fundamentals", "Static typing and generics", ["typescript", "web"], "BEGINNER", 900),
                Course("c2", "Advanced React Patterns", "Hooks, context and performance", ["react", "web"], "ADVANCED", 600),
                Course("c3", "Python for Data Analysis", "Pandas and numpy basics", ["python", "data"], "BEGINNER", 1200),
                Course("c4", "Machine Learning Essentials", "Supervised learning with scikit-learn", ["python", "ml"], "INTERMEDIATE", 800),
                Course("c5", "Go Microservices", "Build services with Go", ["go", "backend"], "INTERMEDIATE", 450),
            ]
        )
        for user, courses in {"u1": ["c1", "c2"], "u2": ["c1", "c2", "c5"], "u3": ["c3", "c4"]}.items():
            for c in courses:
                store.record_enrollment(user, c)
        return store
