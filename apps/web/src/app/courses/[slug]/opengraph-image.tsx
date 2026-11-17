import { ImageResponse } from 'next/og';
import { api } from '../../../lib/api';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const course = await api.getCourse(params.slug).catch(() => null);
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', padding: 80, background: '#4f46e5', color: '#fff' }}>
        <div style={{ fontSize: 32, opacity: 0.8 }}>LearnSphere</div>
        <div style={{ fontSize: 72, fontWeight: 700 }}>{course?.title ?? 'Course'}</div>
      </div>
    ),
    size,
  );
}
