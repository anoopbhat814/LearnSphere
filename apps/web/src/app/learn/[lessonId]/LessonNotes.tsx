'use client';
import { useEffect, useState } from 'react';

export function LessonNotes({ lessonId }: { lessonId: string }) {
  const key = `ls_notes_${lessonId}`;
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(window.localStorage.getItem(key) ?? '');
  }, [key]);

  return (
    <label>
      My notes
      <textarea
        rows={6}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          window.localStorage.setItem(key, e.target.value);
        }}
      />
    </label>
  );
}
