from app.services.similarity import cosine, jaccard, tfidf_vectors, tokenize


def test_tokenize_drops_short_tokens():
    assert tokenize("An API is up!") == ["api"]


def test_cosine_identical_documents_is_one():
    a, b = tfidf_vectors(["python data analysis", "python data analysis"])
    assert round(cosine(a, b), 6) == 1.0


def test_cosine_disjoint_documents_is_zero():
    a, b = tfidf_vectors(["python pandas", "react hooks"])
    assert cosine(a, b) == 0.0


def test_jaccard():
    assert jaccard({"a", "b"}, {"b", "c"}) == 1 / 3
    assert jaccard(set(), set()) == 0.0
