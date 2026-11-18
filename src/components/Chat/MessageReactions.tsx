import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../../lib/utils';
import type { MessageReaction, ReactionGroup } from './reactionTypes';

const initialsOf = (user: { firstName?: string; lastName?: string }) =>
  `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';

const displayName = (user: { firstName?: string; lastName?: string }) =>
  [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Teammate';

/** Aggregate raw reactions into one entry per emoji, preserving first-seen order. */
export const groupReactions = (
  reactions: MessageReaction[] = [],
  currentUserId?: string | null,
): ReactionGroup[] => {
  const groups = new Map<string, ReactionGroup>();

  reactions.forEach(reaction => {
    const existing = groups.get(reaction.emoji);
    if (existing) {
      existing.count += 1;
      existing.users.push(reaction.user);
      if (reaction.user?._id === currentUserId) existing.reactedByMe = true;
      return;
    }

    groups.set(reaction.emoji, {
      emoji: reaction.emoji,
      count: 1,
      reactedByMe: reaction.user?._id === currentUserId,
      users: [reaction.user],
    });
  });

  return Array.from(groups.values());
};

interface MessageReactionsProps {
  reactions: MessageReaction[];
  currentUserId?: string | null;
  /** Toggles this emoji for the current employee (tap the emoji). */
  onToggle?: (emoji: string) => void;
  className?: string;
}

/**
 * WhatsApp-style reaction pills shown just below a bubble. The emoji toggles
 * the current employee's reaction; the count opens a small popover listing
 * everyone who reacted with that emoji.
 */
export function MessageReactions({
  reactions,
  currentUserId,
  onToggle,
  className,
}: MessageReactionsProps) {
  const [openEmoji, setOpenEmoji] = useState<string | null>(null);
  const groups = useMemo(
    () => groupReactions(reactions, currentUserId),
    [reactions, currentUserId],
  );

  if (groups.length === 0) return null;

  return (
    <div className={cn('flex max-w-full flex-wrap items-center gap-1', className)}>
      {groups.map(group => (
        <motion.div
          key={group.emoji}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          onClick={event => event.stopPropagation()}
          onDoubleClick={event => event.stopPropagation()}
          className={cn(
            'inline-flex h-6 items-stretch overflow-hidden rounded-full border text-[12px] shadow-sm transition-colors',
            group.reactedByMe
              ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-400/40 dark:bg-blue-500/15 dark:text-blue-200'
              : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
          )}
        >
          <button
            type="button"
            onClick={() => onToggle?.(group.emoji)}
            aria-label={
              group.reactedByMe
                ? `Remove your ${group.emoji} reaction`
                : `React with ${group.emoji}`
            }
            aria-pressed={group.reactedByMe}
            title={group.reactedByMe ? 'Remove your reaction' : `React with ${group.emoji}`}
            className={cn(
              'flex items-center pl-1.5 pr-1 transition-colors',
              'hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/50',
              'dark:hover:bg-white/10',
            )}
          >
            <span className="text-[13px] leading-none">{group.emoji}</span>
          </button>

          <Popover
            open={openEmoji === group.emoji}
            onOpenChange={open => setOpenEmoji(open ? group.emoji : null)}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`${group.count} ${
                  group.count === 1 ? 'person' : 'people'
                } reacted with ${group.emoji}. Show who reacted`}
                title="Who reacted?"
                className={cn(
                  'flex items-center pl-0.5 pr-1.5 text-[11px] font-semibold leading-none tabular-nums transition-colors',
                  'hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/50',
                  'dark:hover:bg-white/10',
                )}
              >
                {group.count}
              </button>
            </PopoverTrigger>

            <PopoverContent
              side="top"
              align={group.reactedByMe ? 'end' : 'start'}
              sideOffset={6}
              className="w-56 overflow-hidden rounded-xl border-slate-200 p-0 shadow-lg dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                <span className="text-base leading-none">{group.emoji}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {group.count} {group.count === 1 ? 'reaction' : 'reactions'}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto py-1">
                {group.users.map(user => (
                  <div
                    key={`${group.emoji}-${user._id}`}
                    className="flex items-center gap-2 px-3 py-1.5"
                  >
                    <Avatar className="h-6 w-6 border border-slate-200 dark:border-slate-700">
                      {user.photo ? (
                        <AvatarImage src={user.photo} alt={displayName(user)} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-[9px] font-semibold text-white">
                        {initialsOf(user)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs text-slate-700 dark:text-slate-300">
                      {user._id === currentUserId ? 'You' : displayName(user)}
                    </span>
                  </div>
                ))}
              </div>

              {group.reactedByMe && onToggle ? (
                <button
                  type="button"
                  onClick={() => {
                    onToggle(group.emoji);
                    setOpenEmoji(null);
                  }}
                  className="flex w-full items-center gap-1.5 border-t border-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove my reaction
                </button>
              ) : null}
            </PopoverContent>
          </Popover>
        </motion.div>
      ))}
    </div>
  );
}

export default MessageReactions;
