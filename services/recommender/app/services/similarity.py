import math
from collections import Counter
from typing import Dict, List, Sequence


def tokenize(text: str) -> List[str]:
    cleaned = "".join(ch.lower() if ch.isalnum() else " " for ch in text)
    return [t for t in cleaned.split() if len(t) > 2]


def tfidf_vectors(documents: Sequence[str]) -> List[Dict[str, float]]:
    tokenized = [tokenize(d) for d in documents]
    n = len(tokenized)
    df: Counter = Counter()
    for tokens in tokenized:
        df.update(set(tokens))
    vectors = []
    for tokens in tokenized:
        tf = Counter(tokens)
        total = sum(tf.values()) or 1
        vectors.append({t: (c / total) * (math.log((1 + n) / (1 + df[t])) + 1) for t, c in tf.items()})
    return vectors


def cosine(a: Dict[str, float], b: Dict[str, float]) -> float:
    if not a or not b:
        return 0.0
    dot = sum(v * b.get(k, 0.0) for k, v in a.items())
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    return dot / (na * nb) if na and nb else 0.0


def jaccard(a: set, b: set) -> float:
    union = a | b
    return len(a & b) / len(union) if union else 0.0
