import { notFound } from 'next/navigation';
import { totalDuration } from '@learnsphere/shared-types';
import { api } from '../../../lib/api';
import { formatDuration, formatPrice } from '../../../lib/format';
import { EnrollButton } from '../../../components/EnrollButton';

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await api.getCourse(params.slug).catch(() => null);
  if (!course) notFound();

  return (
    <article>
      <h1>{course.title}</h1>
      <p>{course.summary}</p>
      <p>
        By {course.instructorName} · {course.level.toLowerCase()} · {formatDuration(totalDuration(course.modules))} ·{' '}
        {formatPrice(course.priceCents)}
      </p>
      <EnrollButton courseId={course.id} />
      <h2>Curriculum</h2>
      {course.modules.map((m) => (
        <details key={m.id} open={m.position === 1}>
          <summary>{m.title}</summary>
          <ul>
            {m.lessons.map((l) => (
              <li key={l.id}>
                {l.title} <small>({formatDuration(l.durationSeconds)})</small>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </article>
  );
}
