import type { ReactNode } from 'react';

export const metadata = { title: 'Discussion | LearnSphere' };

export default function ForumLayout({ children }: { children: ReactNode }) {
  return <div className="forum-shell">{children}</div>;
}
