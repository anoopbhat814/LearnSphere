import Link from 'next/link';
import type { CourseSummaryDto } from '@learnsphere/shared-types';
import { formatPrice } from '../lib/format';
import { RatingStars } from '@learnsphere/ui';

export function CourseCard({ course }: { course: CourseSummaryDto }) {
  return (
    <Link href={`/courses/${course.slug}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <h3>{course.title}</h3>
      <p>{course.summary}</p>
      <RatingStars value={course.rating ?? 0} />
      <small>{course.enrollmentCount} learners</small>
      <div><strong>{formatPrice(course.priceCents)}</strong></div>
    </Link>
  );
}
