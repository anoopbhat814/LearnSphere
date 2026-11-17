'use client';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api, ApiError } from '../lib/api';

export function EnrollButton({ courseId }: { courseId: string }) {
  const { token } = useAuth();
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onClick() {
    if (!token) return setMessage('Please sign in first.');
    setState('loading');
    try {
      await api.enroll(courseId, token);
      setState('done');
    } catch (e) {
      setState('error');
      setMessage(e instanceof ApiError ? e.message : 'Something went wrong');
    }
  }

  if (state === 'done') return <p>You are enrolled. Happy learning!</p>;
  return (
    <div>
      <button className="btn" disabled={state === 'loading'} onClick={onClick}>Enroll now</button>
      {message && <p role="alert">{message}</p>}
    </div>
  );
}
