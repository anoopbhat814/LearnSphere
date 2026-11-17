'use client';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="card">
      <h2>Your dashboard is unavailable</h2>
      <p>{error.message || 'Please try again in a moment.'}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
