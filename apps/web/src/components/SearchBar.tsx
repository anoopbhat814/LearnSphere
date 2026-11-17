'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function SearchBar({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const router = useRouter();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(value ? `/courses?search=${encodeURIComponent(value)}` : '/courses');
  }

  return (
    <form onSubmit={onSubmit} role="search">
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search courses" aria-label="Search courses" />
      <button className="btn" type="submit">Search</button>
    </form>
  );
}
