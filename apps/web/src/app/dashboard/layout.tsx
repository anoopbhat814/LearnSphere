import type { ReactNode } from 'react';

export const metadata = { title: 'Dashboard | LearnSphere', robots: { index: false } };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <main className="dashboard-shell">{children}</main>;
}
