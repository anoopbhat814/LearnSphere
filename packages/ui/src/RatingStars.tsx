import React from 'react';

export function RatingStars({ value, max = 5 }: { value: number; max?: number }) {
  const full = Math.round(value);
  return (
    <span aria-label={`Rated ${value.toFixed(1)} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => (i < full ? '★' : '☆')).join('')}
    </span>
  );
}
