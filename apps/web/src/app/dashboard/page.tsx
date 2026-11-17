'use client';
import useSWR from 'swr';
import { useAuth } from '../../hooks/useAuth';
import { ProgressBar } from '@learnsphere/ui';

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { authorization: `Bearer ${token}` } }).then((r) => r.json());

export default function DashboardPage() {
  const { token } = useAuth();
  const { data: enrollments = [] } = useSWR(token ? ['/api/enrollments/me', token] : null, ([u, t]) => fetcher(u, t));
  const { data: recs = [] } = useSWR(token ? ['/api/recommendations', token] : null, ([u, t]) => fetcher(u, t));

  return (
    <div>
      <h1>My learning</h1>
      {enrollments.map((e: { id: string; course: { title: string }; status: string }) => (
        <div className="card" key={e.id}>
          <h3>{e.course.title}</h3>
          <ProgressBar percent={e.status === 'COMPLETED' ? 100 : 25} label="Course progress" />
        </div>
      ))}
      <h2>Recommended for you</h2>
      <ul>
        {recs.map((r: { courseId: string; reason: string }) => (
          <li key={r.courseId}>{r.courseId} - {r.reason}</li>
        ))}
      </ul>
    </div>
  );
}
