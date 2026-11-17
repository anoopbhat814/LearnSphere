from typing import List

from pydantic import BaseModel, Field


class RecommendRequest(BaseModel):
    user_id: str
    enrolled_course_ids: List[str] = Field(default_factory=list)
    limit: int = Field(default=8, ge=1, le=50)


class RecommendationItem(BaseModel):
    course_id: str
    score: float
    reason: str


class RecommendResponse(BaseModel):
    items: List[RecommendationItem]


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=1)


class AnalyzeResponse(BaseModel):
    word_count: int
    reading_minutes: float
    readability: float
    keywords: List[str]
    difficulty: str
