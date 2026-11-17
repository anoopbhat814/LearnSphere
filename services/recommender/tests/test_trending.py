from app.services.trending import TrendingTracker


def test_recent_events_outweigh_old_ones():
    tracker = TrendingTracker(half_life_hours=1)
    now = 1_000_000.0
    for _ in range(3):
        tracker.record("old", now - 10 * 3600)
    tracker.record("fresh", now)
    tracker.record("fresh", now - 60)
    assert tracker.top(1, now=now)[0][0] == "fresh"
