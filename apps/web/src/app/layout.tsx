import type { ReactNode } from 'react';
import { AuthProvider } from '../hooks/useAuth';
import { NavBar } from '../components/NavBar';
import './globals.css';

export const metadata = { title: 'LearnSphere', description: 'Learn anything, at your own pace.' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavBar />
          <main className="container">{children}</main>
        </AuthProvider>
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}" }} />
      </body>
    </html>
  );
}
