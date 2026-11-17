from dataclasses import dataclass, field
from typing import List


@dataclass(frozen=True)
class Course:
    id: str
    title: str
    description: str
    tags: List[str] = field(default_factory=list)
    level: str = "BEGINNER"
    popularity: int = 0

    @property
    def document(self) -> str:
        """Text used for content-based similarity."""
        return " ".join([self.title, self.description, " ".join(self.tags)])
