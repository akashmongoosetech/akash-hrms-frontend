import { useCallback, useEffect, useState } from 'react';

const STORAGE_PREFIX = 'hrms:chat:recentEmojis:';
const MAX_RECENT = 24;

const read = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

/**
 * Recently used reactions, stored per employee so switching accounts on a
 * shared machine does not leak someone else's history. Deliberately local:
 * recents are a UI convenience, not conversation data.
 */
export function useRecentEmojis(userId?: string | null) {
  const key = `${STORAGE_PREFIX}${userId || 'anonymous'}`;
  const [recents, setRecents] = useState<string[]>(() => read(key));

  useEffect(() => {
    setRecents(read(key));
  }, [key]);

  const remember = useCallback(
    (emoji: string) => {
      setRecents(previous => {
        const next = [emoji, ...previous.filter(item => item !== emoji)].slice(0, MAX_RECENT);
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Storage can be unavailable (private mode); the picker still works.
        }
        return next;
      });
    },
    [key],
  );

  return { recents, remember };
}
