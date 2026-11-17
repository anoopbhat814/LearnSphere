import Link from 'next/link';

export default function CourseNotFound() {
  return (
    <section>
      <h1>Course not found</h1>
      <p>The course you are looking for may have been unpublished or renamed.</p>
      <Link href="/courses">Browse the catalogue</Link>
    </section>
  );
}
