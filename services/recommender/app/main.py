from fastapi import FastAPI

from app.models.schemas import AnalyzeRequest, AnalyzeResponse, RecommendRequest, RecommendResponse
from app.services.catalog import CatalogStore
from app.services.content_analysis import analyze_text
from app.services.recommender import HybridRecommender

app = FastAPI(title="LearnSphere Recommender", version="1.0.0")
catalog = CatalogStore.with_sample_data()
engine = HybridRecommender(catalog)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "courses": len(catalog.courses)}


@app.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest) -> RecommendResponse:
    items = engine.recommend(req.user_id, set(req.enrolled_course_ids), req.limit)
    return RecommendResponse(items=items)


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    return analyze_text(req.text)
