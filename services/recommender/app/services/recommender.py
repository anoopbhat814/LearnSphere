from typing import Dict, List, Set

from app.models.schemas import RecommendationItem
from app.services.catalog import CatalogStore
from app.services.similarity import cosine, jaccard, tfidf_vectors


class HybridRecommender:
    """Blends content-based (TF-IDF) and collaborative (user overlap) signals."""

    def __init__(self, catalog: CatalogStore, content_weight: float = 0.6):
        self.catalog = catalog
        self.content_weight = content_weight

    def _content_scores(self, enrolled: Set[str]) -> Dict[str, float]:
        courses = self.catalog.all()
        vectors = dict(zip([c.id for c in courses], tfidf_vectors([c.document for c in courses])))
        scores: Dict[str, float] = {}
        for course in courses:
            if course.id in enrolled or not enrolled:
                continue
            scores[course.id] = max(cosine(vectors[course.id], vectors[e]) for e in enrolled if e in vectors)
        return scores

    def _collab_scores(self, user_id: str, enrolled: Set[str]) -> Dict[str, float]:
        scores: Dict[str, float] = {}
        for other, other_courses in self.catalog.enrollments.items():
            if other == user_id:
                continue
            weight = jaccard(enrolled, other_courses)
            if weight == 0:
                continue
            for cid in other_courses - enrolled:
                scores[cid] = scores.get(cid, 0.0) + weight
        peak = max(scores.values(), default=1.0)
        return {k: v / peak for k, v in scores.items()}

    def recommend(self, user_id: str, enrolled: Set[str], limit: int = 8) -> List[RecommendationItem]:
        content = self._content_scores(enrolled)
        collab = self._collab_scores(user_id, enrolled)
        max_pop = max((c.popularity for c in self.catalog.all()), default=1) or 1
        items = []
        for course in self.catalog.all():
            if course.id in enrolled:
                continue
            c, f = content.get(course.id, 0.0), collab.get(course.id, 0.0)
            pop = course.popularity / max_pop
            blended = self.content_weight * c + (1 - self.content_weight) * f
            score = blended if blended > 0 else 0.1 * pop  # cold start falls back to popularity
            reason = "Similar to courses you took" if c >= f and c > 0 else (
                "Learners like you also enrolled" if f > 0 else "Popular right now")
            items.append(RecommendationItem(course_id=course.id, score=round(score, 4), reason=reason))
        return sorted(items, key=lambda i: i.score, reverse=True)[:limit]
