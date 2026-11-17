import { ThreadList } from '../../../components/ThreadList';

export default async function ForumPage({ params }: { params: { courseId: string } }) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const res = await fetch(`${base}/api/forum/courses/${params.courseId}/threads`, { cache: 'no-store' });
  const threads = res.ok ? await res.json() : [];
  return (
    <section>
      <h1>Course discussion</h1>
      <ThreadList threads={threads} />
    </section>
  );
}
