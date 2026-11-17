import math
import time
from collections import defaultdict
from typing import Dict, List, Optional, Tuple


class TrendingTracker:
    """Exponentially decayed enrollment counts to surface currently popular courses."""

    def __init__(self, half_life_hours: float = 48.0):
        self.decay = math.log(2) / (half_life_hours * 3600)
        self._events: Dict[str, List[float]] = defaultdict(list)

    def record(self, course_id: str, at: Optional[float] = None) -> None:
        self._events[course_id].append(at if at is not None else time.time())

    def top(self, n: int = 5, now: Optional[float] = None) -> List[Tuple[str, float]]:
        now = now if now is not None else time.time()
        scored = {
            cid: sum(math.exp(-self.decay * (now - t)) for t in times)
            for cid, times in self._events.items()
        }
        return sorted(scored.items(), key=lambda kv: kv[1], reverse=True)[:n]
