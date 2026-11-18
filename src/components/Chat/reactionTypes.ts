// Shared types for the chat reaction system. Kept in one place so the message
// list, the reaction pills, the quick toolbar and the full emoji picker all
// agree on the shape the API returns.

export interface ReactionUser {
  _id: string;
  firstName: string;
  lastName: string;
  photo?: string | null;
}

export interface MessageReaction {
  emoji: string;
  createdAt: string;
  user: ReactionUser;
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  users: ReactionUser[];
}

/** Quick bar shown directly above a message on long-press / right-click. */
export const REACTION_EMOJIS = [
  '👍',
  '❤️',
  '😂',
  '😮',
  '😢',
  '🙏',
  '🤝',
  '🔥',
  '👏',
  '😍',
] as const;

/** Emoji used by the double-click / double-tap shortcut. */
export const QUICK_REACTION_EMOJI = '❤️';
