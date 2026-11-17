import React from 'react';

export interface ProgressBarProps {
  percent: number;
  label?: string;
}

export function ProgressBar({ percent, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div>
      {label && <small>{label}: {clamped}%</small>}
      <div className="progress" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
