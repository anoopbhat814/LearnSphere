'use client';
import { useAuth } from '../../../hooks/useAuth';
import { VideoPlayer } from '../../../components/VideoPlayer';
import { useProgressTracker } from '../../../hooks/useProgressTracker';

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  const { token } = useAuth();
  const { report } = useProgressTracker(params.lessonId, token);

  return (
    <div>
      <VideoPlayer src={`/media/${params.lessonId}/master.m3u8`} onTime={report} />
      <p>Your progress is saved automatically.</p>
    </div>
  );
}
