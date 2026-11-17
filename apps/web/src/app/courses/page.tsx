import { api } from '../../lib/api';
import { CourseCard } from '../../components/CourseCard';
import { SearchBar } from '../../components/SearchBar';

export default async function CatalogPage({ searchParams }: { searchParams: Record<string, string> }) {
  const data = await api.listCourses(searchParams);
  return (
    <section>
      <h1>Course catalogue</h1>
      <SearchBar initial={searchParams.search ?? ''} />
      <p>{data.total} courses found</p>
      <div className="grid">
        {data.items.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </section>
  );
}
