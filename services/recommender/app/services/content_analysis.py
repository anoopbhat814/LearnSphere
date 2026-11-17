import re
from collections import Counter

from app.models.schemas import AnalyzeResponse
from app.services.similarity import tokenize

STOPWORDS = {"the", "and", "for", "that", "with", "this", "are", "you", "your", "from", "will", "can", "have"}


def count_syllables(word: str) -> int:
    groups = re.findall(r"[aeiouy]+", word.lower())
    count = len(groups)
    if word.lower().endswith("e") and count > 1:
        count -= 1
    return max(count, 1)


def flesch_reading_ease(text: str) -> float:
    sentences = max(len(re.findall(r"[.!?]+", text)), 1)
    words = re.findall(r"[A-Za-z']+", text)
    if not words:
        return 0.0
    syllables = sum(count_syllables(w) for w in words)
    return round(206.835 - 1.015 * (len(words) / sentences) - 84.6 * (syllables / len(words)), 2)


def difficulty_label(score: float) -> str:
    if score >= 60:
        return "BEGINNER"
    if score >= 30:
        return "INTERMEDIATE"
    return "ADVANCED"


def analyze_text(text: str) -> AnalyzeResponse:
    words = re.findall(r"[A-Za-z']+", text)
    keywords = [w for w, _ in Counter(t for t in tokenize(text) if t not in STOPWORDS).most_common(5)]
    score = flesch_reading_ease(text)
    return AnalyzeResponse(
        word_count=len(words),
        reading_minutes=round(len(words) / 200, 2),
        readability=score,
        keywords=keywords,
        difficulty=difficulty_label(score),
    )
