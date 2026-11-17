'use client';
import { useEffect, useRef } from 'react';

interface Props {
  src: string;
  onTime?: (seconds: number) => void;
}

export function VideoPlayer({ src, onTime }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const handler = () => onTime?.(video.currentTime);
    video.addEventListener('timeupdate', handler);
    return () => video.removeEventListener('timeupdate', handler);
  }, [onTime]);

  return <video ref={ref} src={src} controls style={{ width: '100%', borderRadius: 12 }} />;
}
