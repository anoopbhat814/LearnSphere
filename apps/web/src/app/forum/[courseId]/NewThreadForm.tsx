'use client';
import { FormEvent, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export function NewThreadForm({ courseId }: { courseId: string }) {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!token || !title.trim()) return;
    setBusy(true);
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    await fetch(`${base}/api/forum/courses/${courseId}/threads`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ title }),
    });
    setTitle('');
    setBusy(false);
  }

  return (
    <form onSubmit={submit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ask a question" />
      <button disabled={busy || !token}>Post</button>
    </form>
  );
}
