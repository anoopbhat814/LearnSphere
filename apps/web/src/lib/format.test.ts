import { describe, expect, it } from 'vitest';
import { formatDuration, formatPrice, timeAgo } from './format';

describe('format helpers', () => {
  it('formats free and paid prices', () => {
    expect(formatPrice(0)).toBe('Free');
    expect(formatPrice(4900)).toBe('$49.00');
  });

  it('formats durations', () => {
    expect(formatDuration(540)).toBe('9m');
    expect(formatDuration(3900)).toBe('1h 5m');
  });

  it('renders relative time', () => {
    const now = Date.parse('2024-05-01T12:00:00Z');
    expect(timeAgo('2024-05-01T11:00:00Z', now)).toBe('1h ago');
  });
});
