'use client';

export default function CatalogError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="card">
      <h2>We couldn't load the catalogue</h2>
      <p>{error.message || 'Please try again in a moment.'}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
