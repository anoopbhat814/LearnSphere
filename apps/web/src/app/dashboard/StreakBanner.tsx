import { Badge } from '@learnsphere/ui';

export function StreakBanner({ days }: { days: number }) {
  if (days < 2) return null;
  return (
    <p>
      <Badge tone={days >= 7 ? 'success' : 'neutral'}>{days}-day streak</Badge> Keep it going!
    </p>
  );
}
