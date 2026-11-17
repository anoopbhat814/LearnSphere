'use client';

export default function ForumError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="card">
      <h2>The discussion couldn't be loaded</h2>
      <p>{error.message || 'Please try again in a moment.'}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
