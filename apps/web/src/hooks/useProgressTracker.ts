'use client';
import { useEffect, useRef } from 'react';

/** Debounced reporter: sends playback position at most every `intervalMs`. */
export function useProgressTracker(lessonId: string, token: string | null, intervalMs = 10_000) {
  const latest = useRef(0);
  const lastSent = useRef(0);

  useEffect(() => {
    if (!token) return;
    const timer = setInterval(async () => {
      if (latest.current === lastSent.current) return;
      lastSent.current = latest.current;
      await fetch(`/api/progress/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ watchedSec: Math.floor(latest.current) }),
      }).catch(() => undefined);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [lessonId, token, intervalMs]);

  return { report: (seconds: number) => { latest.current = seconds; } };
}
