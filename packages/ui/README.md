# @learnsphere/ui

Small set of presentational React components shared by the web app.

```tsx
import { Badge, ProgressBar, RatingStars } from '@learnsphere/ui';

<Badge tone="success">Completed</Badge>
<ProgressBar percent={42} label="Course progress" />
<RatingStars value={4.3} />
```

Components are intentionally unstyled beyond a few inline defaults; global
styles live in `apps/web/src/app/globals.css`.
