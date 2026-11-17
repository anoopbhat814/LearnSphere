import React, { ReactNode } from 'react';

type Tone = 'neutral' | 'success' | 'warning';
const COLORS: Record<Tone, string> = { neutral: '#e5e7eb', success: '#bbf7d0', warning: '#fde68a' };

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span style={{ background: COLORS[tone], borderRadius: 999, padding: '2px 10px', fontSize: 12 }}>
      {children}
    </span>
  );
}
