import type { ReactNode } from 'react';

export const metadata = { title: 'Courses | LearnSphere' };

export default function CoursesLayout({ children }: { children: ReactNode }) {
  return <div className="courses-shell">{children}</div>;
}
