import type { ReactNode } from 'react';

export const metadata = { title: 'Lesson | LearnSphere', robots: { index: false } };

export default function LessonLayout({ children }: { children: ReactNode }) {
  return <div className="lesson-shell">{children}</div>;
}
