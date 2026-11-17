from app.services.catalog import CatalogStore
from app.services.recommender import HybridRecommender


def test_recommendations_exclude_enrolled_courses():
    engine = HybridRecommender(CatalogStore.with_sample_data())
    items = engine.recommend("u1", {"c1", "c2"}, limit=5)
    assert all(i.course_id not in {"c1", "c2"} for i in items)


def test_collaborative_signal_surfaces_go_course():
    engine = HybridRecommender(CatalogStore.with_sample_data())
    items = engine.recommend("new-user", {"c1", "c2"}, limit=3)
    assert items[0].course_id == "c5"


def test_cold_start_returns_popular_first():
    engine = HybridRecommender(CatalogStore.with_sample_data())
    items = engine.recommend("nobody", set(), limit=2)
    assert items[0].course_id == "c3"
