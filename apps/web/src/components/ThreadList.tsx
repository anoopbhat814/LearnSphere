import type { ForumThreadDto } from '@learnsphere/shared-types';
import { timeAgo } from '../lib/format';

export function ThreadList({ threads }: { threads: ForumThreadDto[] }) {
  if (threads.length === 0) return <p>No discussions yet. Start the first one!</p>;
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {threads.map((t) => (
        <li key={t.id} className="card" style={{ marginBottom: 12 }}>
          <strong>{t.pinned ? 'Pinned: ' : ''}{t.title}</strong>
          {t.resolved && <span> (resolved)</span>}
          <div><small>{t.authorName} · {timeAgo(t.createdAt)} · {t.replyCount} replies</small></div>
        </li>
      ))}
    </ul>
  );
}
