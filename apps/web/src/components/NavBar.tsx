'use client';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export function NavBar() {
  const { token, logout } = useAuth();
  return (
    <nav style={{ display: 'flex', gap: 16, padding: '12px 24px', background: '#fff' }}>
      <Link href="/"><strong>LearnSphere</strong></Link>
      <Link href="/courses">Courses</Link>
      {token ? (
        <>
          <Link href="/dashboard">My learning</Link>
          <button className="btn" onClick={logout}>Sign out</button>
        </>
      ) : (
        <Link href="/login">Sign in</Link>
      )}
    </nav>
  );
}
