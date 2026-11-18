import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MORE_REACTION_EMOJIS, REACTION_EMOJIS } from './reactionTypes';

interface ReactionToolbarProps {
  /** Viewport rect of the message the toolbar belongs to, or null when closed. */
  anchorRect: DOMRect | null;
  /** Emojis the signed-in user already reacted with on this message. */
  selectedEmojis?: string[];
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const VIEWPORT_MARGIN = 8;
const ANCHOR_GAP = 10;

/**
 * Floating WhatsApp-style reaction bar. Rendered in a portal so the scrollable
 * message list can never clip it, and clamped to the viewport so it stays fully
 * visible near any screen edge.
 */
export default function ReactionToolbar({
  anchorRect,
  selectedEmojis = [],
  onSelect,
  onClose,
}: ReactionToolbarProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [showMore, setShowMore] = useState(false);
  const open = Boolean(anchorRect);

  // Reset the "more" grid every time the toolbar targets a new message.
  useEffect(() => {
    setShowMore(false);
    setPosition(null);
  }, [anchorRect]);

  useLayoutEffect(() => {
    if (!anchorRect) return;

    const panel = panelRef.current;
    if (!panel) return;

    const { width, height } = panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Horizontally centred on the bubble, then clamped to the viewport.
    let left = anchorRect.left + anchorRect.width / 2 - width / 2;
    left = Math.min(
      Math.max(VIEWPORT_MARGIN, left),
      Math.max(VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN),
    );

    // Prefer above the bubble; fall back below when there is no room.
    let top = anchorRect.top - height - ANCHOR_GAP;
    if (top < VIEWPORT_MARGIN) top = anchorRect.bottom + ANCHOR_GAP;
    if (top + height > viewportHeight - VIEWPORT_MARGIN) {
      top = Math.max(VIEWPORT_MARGIN, viewportHeight - height - VIEWPORT_MARGIN);
    }

    setPosition({ top, left });
  }, [anchorRect, showMore]);

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
      if (event.key === 'Escape') onClose();
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
  }, [open, onClose]);

  const selected = useMemo(() => new Set(selectedEmojis), [selectedEmojis]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {anchorRect ? (
        <motion.div
          key="reaction-toolbar"
          ref={panelRef}
          role="dialog"
          aria-label="Pick a reaction"
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
          className="select-none rounded-full border border-slate-200 bg-white p-1 shadow-[0_10px_30px_-8px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center gap-0.5">
            {REACTION_EMOJIS.map(emoji => {
              const isSelected = selected.has(emoji);
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelect(emoji)}
                  title={isSelected ? `Remove ${emoji}` : `React with ${emoji}`}
                  aria-label={isSelected ? `Remove ${emoji} reaction` : `React with ${emoji}`}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-[22px] leading-none transition',
                    'hover:scale-110 hover:bg-slate-100 active:scale-95 dark:hover:bg-slate-700',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60',
                    isSelected && 'bg-blue-50 ring-2 ring-blue-500/60 dark:bg-blue-500/20',
                  )}
                >
                  <span aria-hidden="true">{emoji}</span>
                </button>
              );
            })}

            <span className="mx-1 h-7 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />

            <button
              type="button"
              onClick={() => setShowMore(previous => !previous)}
              title="More emojis"
              aria-label="More emojis"
              aria-expanded={showMore}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition',
                'hover:scale-110 hover:bg-slate-100 hover:text-slate-800 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60',
                showMore && 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-white',
              )}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showMore ? (
              <motion.div
                key="more-emojis"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="mt-1 max-h-[184px] w-[304px] overflow-y-auto border-t border-slate-100 pt-1 dark:border-slate-700">
                  <div className="grid grid-cols-8 gap-0.5">
                    {MORE_REACTION_EMOJIS.map(emoji => {
                      const isSelected = selected.has(emoji);
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => onSelect(emoji)}
                          title={isSelected ? `Remove ${emoji}` : `React with ${emoji}`}
                          aria-label={isSelected ? `Remove ${emoji} reaction` : `React with ${emoji}`}
                          aria-pressed={isSelected}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg text-[18px] leading-none transition',
                            'hover:bg-slate-100 active:scale-95 dark:hover:bg-slate-700',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60',
                            isSelected && 'bg-blue-50 ring-1 ring-blue-500/60 dark:bg-blue-500/20',
                          )}
                        >
                          <span aria-hidden="true">{emoji}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
