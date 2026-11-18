import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { REACTION_EMOJIS } from './reactionTypes';
import EmojiPicker from './EmojiPicker';

interface ReactionToolbarProps {
  /** Viewport rect of the message the toolbar belongs to, or null when closed. */
  anchorRect: DOMRect | null;
  /** Emojis the signed-in user already reacted with on this message. */
  selectedEmojis?: string[];
  /** Recently used emojis, newest first. */
  recents?: string[];
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const VIEWPORT_MARGIN = 8;
const ANCHOR_GAP = 10;
const COMPACT_BREAKPOINT = 640;

/**
 * Floating WhatsApp-style reaction bar. Rendered in a portal so the scrollable
 * message list can never clip it, and clamped to the viewport so it stays fully
 * visible near any screen edge. The "More" button swaps the quick bar for the
 * full emoji picker in place.
 */
export default function ReactionToolbar({
  anchorRect,
  selectedEmojis = [],
  recents = [],
  onSelect,
  onClose,
}: ReactionToolbarProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [view, setView] = useState<'quick' | 'picker'>('quick');
  const open = Boolean(anchorRect);

  // Every new message starts on the quick bar.
  useEffect(() => {
    setView('quick');
    setPosition(null);
  }, [anchorRect]);

  useLayoutEffect(() => {
    if (!anchorRect) return;

    const panel = panelRef.current;
    if (!panel) return;

    const { width, height } = panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = anchorRect.left + anchorRect.width / 2 - width / 2;
    left = Math.min(
      Math.max(VIEWPORT_MARGIN, left),
      Math.max(VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN),
    );

    let top = anchorRect.top - height - ANCHOR_GAP;
    if (top < VIEWPORT_MARGIN) top = anchorRect.bottom + ANCHOR_GAP;
    if (top + height > viewportHeight - VIEWPORT_MARGIN) {
      top = Math.max(VIEWPORT_MARGIN, viewportHeight - height - VIEWPORT_MARGIN);
    }

    // The full picker is tall; on phones it reads better anchored to the
    // bottom of the viewport instead of floating over the message.
    if (view === 'picker' && viewportWidth < COMPACT_BREAKPOINT) {
      left = Math.max(VIEWPORT_MARGIN, (viewportWidth - width) / 2);
      top = Math.max(VIEWPORT_MARGIN, viewportHeight - height - VIEWPORT_MARGIN);
    }

    setPosition({ top, left });
  }, [anchorRect, view]);

  // Outside click / Escape / scroll dismissal.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (panelRef.current && event.target instanceof Node && panelRef.current.contains(event.target)) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (view === 'picker') setView('quick');
      else onClose();
    };

    const handleScroll = (event: Event) => {
      if (panelRef.current && event.target instanceof Node && panelRef.current.contains(event.target)) {
        return;
      }
      onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', onClose);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', onClose);
    };
  }, [open, onClose, view]);

  const selected = useMemo(() => new Set(selectedEmojis), [selectedEmojis]);

  const handlePick = useCallback(
    (emoji: string) => {
      onSelect(emoji);
    },
    [onSelect],
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {anchorRect ? (
        <motion.div
          key="reaction-toolbar"
          ref={panelRef}
          role="dialog"
          aria-label={view === 'picker' ? 'Emoji picker' : 'Pick a reaction'}
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 4 }}
          transition={{ type: 'spring', stiffness: 520, damping: 32, mass: 0.7 }}
          style={{
            position: 'fixed',
            top: position?.top ?? -9999,
            left: position?.left ?? -9999,
            transformOrigin: 'center bottom',
            zIndex: 90,
          }}
          className={cn(
            'select-none border border-slate-200 bg-white shadow-[0_10px_30px_-8px_rgba(15,23,42,0.35)]',
            'dark:border-slate-700 dark:bg-slate-800',
            view === 'picker'
              ? 'overflow-hidden rounded-2xl'
              : 'rounded-full p-1',
          )}
        >
          {view === 'picker' ? (
            <EmojiPicker
              recents={recents}
              onSelect={handlePick}
              onClose={onClose}
              onBack={() => setView('quick')}
            />
          ) : (
            <div className="flex max-w-[calc(100vw_-_1rem)] flex-wrap items-center justify-center gap-0.5">
              {REACTION_EMOJIS.map(emoji => {
                const isSelected = selected.has(emoji);
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handlePick(emoji)}
                    title={isSelected ? `Remove ${emoji}` : `React with ${emoji}`}
                    aria-label={isSelected ? `Remove ${emoji} reaction` : `React with ${emoji}`}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-[20px] leading-none transition sm:h-10 sm:w-10 sm:text-[22px]',
                      'hover:scale-110 hover:bg-slate-100 active:scale-95 dark:hover:bg-slate-700',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60',
                      isSelected && 'bg-blue-50 ring-2 ring-blue-500/60 dark:bg-blue-500/20',
                    )}
                  >
                    <span aria-hidden="true">{emoji}</span>
                  </button>
                );
              })}

              <span
                className="mx-0.5 h-6 w-px bg-slate-200 dark:bg-slate-700"
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={() => setView('picker')}
                title="More emojis"
                aria-label="More emojis"
                aria-haspopup="dialog"
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition sm:h-10 sm:w-10',
                  'hover:scale-110 hover:bg-slate-100 hover:text-slate-800 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-700',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60',
                )}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
