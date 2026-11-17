import { api } from '../lib/api';
import { CourseCard } from '../components/CourseCard';

export const revalidate = 60;

export default async function HomePage() {
  const { items } = await api.listCourses({ pageSize: '8' }).catch(() => ({ items: [] }));
  return (
    <section>
      <h1>Learn something new today</h1>
      <p style={{ color: 'var(--muted)' }}>Hundreds of courses from expert instructors.</p>
      <div className="grid">
        {items.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
