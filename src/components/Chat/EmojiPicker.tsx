import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Coffee,
  Flag,
  Heart,
  Leaf,
  Lightbulb,
  Plane,
  Search,
  Smile,
  Trophy,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { loadEmojiCategories, type PickerCategory, type PickerEmoji } from './emojiData';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  frequent: Clock,
  people: Smile,
  nature: Leaf,
  foods: Coffee,
  activity: Trophy,
  places: Plane,
  objects: Lightbulb,
  symbols: Heart,
  flags: Flag,
};

interface Section {
  id: string;
  label: string;
  emojis: PickerEmoji[];
}

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  onBack?: () => void;
  /** Recently used emojis, newest first. */
  recents?: string[];
}

/**
 * Full emoji picker: search, category navigation, recents and a scrollable
 * native-emoji grid. Rendered inside the reaction toolbar's portal, so it is
 * never clipped by the message list.
 */
export default function EmojiPicker({
  onSelect,
  onClose,
  onBack,
  recents = [],
}: EmojiPickerProps) {
  const [categories, setCategories] = useState<PickerCategory[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState('frequent');

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollFrame = useRef<number | null>(null);
  const pendingCategoryRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      setFailed(false);
      loadEmojiCategories()
        .then(data => {
          if (!cancelled) setCategories(data);
        })
        .catch(error => {
          console.error('Could not load the emoji dataset:', error);
          if (!cancelled) setFailed(true);
        });
    };

    load();
    return () => {
      cancelled = true;
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    };
  }, []);

  const emojiIndex = useMemo(() => {
    const map = new Map<string, PickerEmoji>();
    categories?.forEach(category => {
      category.emojis.forEach(emoji => map.set(emoji.native, emoji));
    });
    return map;
  }, [categories]);

  const flatEmojis = useMemo(
    () => (categories ?? []).flatMap(category => category.emojis),
    [categories],
  );

  const sections = useMemo<Section[]>(() => {
    const list: Section[] = [];
    const recentEmojis = recents
      .map(native => emojiIndex.get(native))
      .filter((emoji): emoji is PickerEmoji => Boolean(emoji));

    if (recentEmojis.length) {
      list.push({ id: 'frequent', label: 'Frequently Used', emojis: recentEmojis });
    }
    (categories ?? []).forEach(category => list.push(category));
    return list;
  }, [categories, emojiIndex, recents]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return null;
    return flatEmojis.filter(emoji => emoji.search.includes(term)).slice(0, 400);
  }, [flatEmojis, query]);

  // Keep the highlighted category in sync while scrolling the grid.
  const handleScroll = useCallback(() => {
    if (scrollFrame.current !== null) return;
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = null;
      const container = scrollRef.current;
      if (!container) return;

      const offset = container.scrollTop + 12;
      let current = sections[0]?.id;
      sections.forEach(section => {
        const element = sectionRefs.current[section.id];
        if (element && element.offsetTop <= offset) current = section.id;
      });
      if (current) setActiveId(current);
    });
  }, [sections]);

  const scrollToCategory = useCallback(
    (id: string) => {
      // While a search is active the category sections are unmounted; remember
      // the target and scroll once the full grid is back.
      if (query.trim()) {
        pendingCategoryRef.current = id;
        setQuery('');
        return;
      }

      const container = scrollRef.current;
      const section = sectionRefs.current[id];
      if (!container || !section) return;
      setActiveId(id);
      container.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
    },
    [query],
  );

  useEffect(() => {
    if (query) return;
    const id = pendingCategoryRef.current;
    if (!id) return;
    pendingCategoryRef.current = null;
    const container = scrollRef.current;
    const section = sectionRefs.current[id];
    if (container && section) {
      setActiveId(id);
      container.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
    }
  }, [query]);

  // Highlight the first real category until the employee scrolls or picks one.
  useEffect(() => {
    if (!categories?.length) return;
    if (recents.length) return;
    setActiveId(previous => (previous === 'frequent' ? categories[0].id : previous));
  }, [categories, recents.length]);

  const canAutoFocus = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
    [],
  );

  const renderEmoji = (emoji: PickerEmoji) => (
    <button
      key={`${emoji.categoryId}-${emoji.id}`}
      type="button"
      onClick={() => onSelect(emoji.native)}
      title={emoji.name}
      aria-label={emoji.name}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg text-[20px] leading-none transition',
        'hover:scale-110 hover:bg-slate-100 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60',
        'dark:hover:bg-slate-700',
      )}
    >
      <span aria-hidden="true">{emoji.native}</span>
    </button>
  );

  return (
    <div
      className="flex h-[420px] max-h-[calc(100dvh_-_2rem)] w-[344px] max-w-[calc(100vw_-_1rem)] flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
      role="dialog"
      aria-label="Emoji picker"
    >
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-2 py-2 dark:border-slate-800">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to quick reactions"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : null}

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
            autoFocus={canAutoFocus}
            placeholder="Search emojis…"
            className="h-8 w-full rounded-lg border border-transparent bg-slate-100 pl-8 pr-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close emoji picker"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Category navigation */}
      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-slate-100 px-1.5 py-1 dark:border-slate-800">
        {sections.map(section => {
          const Icon = CATEGORY_ICONS[section.id] ?? Smile;
          const isActive = !results && activeId === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToCategory(section.id)}
              title={section.label}
              aria-label={section.label}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition',
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
              )}
            >
              <Icon className="h-[15px] w-[15px]" />
            </button>
          );
        })}
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative min-h-0 flex-1 overflow-y-auto px-1.5 pb-2 pt-1"
      >
        {failed ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Emojis could not be loaded
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Check your connection and reopen the picker.
            </p>
          </div>
        ) : !categories ? (
          <div className="grid grid-cols-8 gap-1 p-1">
            {Array.from({ length: 64 }).map((_, index) => (
              <div
                key={index}
                className="h-9 w-9 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : results ? (
          results.length ? (
            <div className="grid grid-cols-8 gap-1 p-1">{results.map(renderEmoji)}</div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Search className="h-4 w-4" />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                No emojis found
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Try “heart”, “hand”, “fire”…
              </p>
            </div>
          )
        ) : (
          sections.map(section => (
            <div
              key={section.id}
              ref={element => {
                sectionRefs.current[section.id] = element;
              }}
            >
              <p className="sticky top-0 z-10 bg-white/95 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 backdrop-blur dark:bg-slate-900/95">
                {section.label}
              </p>
              <div className="grid grid-cols-8 gap-1">{section.emojis.map(renderEmoji)}</div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
        <span>Pick an emoji to react</span>
        {categories ? <span>{flatEmojis.length.toLocaleString()} emojis</span> : null}
      </div>
    </div>
  );
}
