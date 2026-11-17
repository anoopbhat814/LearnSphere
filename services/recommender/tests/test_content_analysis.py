from fastapi.testclient import TestClient

from app.main import app
from app.services.content_analysis import analyze_text, count_syllables


def test_syllable_counter():
    assert count_syllables("code") == 1
    assert count_syllables("education") >= 4


def test_simple_text_is_beginner():
    result = analyze_text("The cat sat on the mat. It was a big cat.")
    assert result.difficulty == "BEGINNER"
    assert result.word_count == 11


def test_analyze_endpoint():
    client = TestClient(app)
    res = client.post("/analyze", json={"text": "Generics enable reusable typed components."})
    assert res.status_code == 200
    assert "generics" in res.json()["keywords"]
