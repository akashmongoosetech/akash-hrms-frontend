// Shared types for the chat reaction system. Kept in one place so the message
// list, the reaction pills and the floating toolbar all agree on the shape the
// API returns.

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

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const;

export const QUICK_REACTION_EMOJI = '❤️';

// Extra emojis behind the "more" button. A curated grid keeps the picker fast
// and avoids pulling a large emoji-picker dependency into the bundle.
export const MORE_REACTION_EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '😇', '🙂', '😉',
  '😍', '🥰', '😘', '😜', '🤪', '🤨', '🧐', '🤓',
  '😎', '🥳', '😏', '😒', '😞', '😔', '😟', '😕',
  '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭',
  '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶',
  '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🫡',
  '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄',
  '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤',
  '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷',
  '🤒', '🤕', '🤑', '🤠', '😈', '👿', '🤡', '💩',
  '👻', '💀', '👽', '🤖', '😺', '😸', '😹', '😻',
  '💋', '💌', '💘', '💝', '💖', '💗', '💓', '💕',
  '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎',
  '🖤', '🤍', '💯', '💢', '💥', '💫', '💦', '💨',
  '👋', '🤚', '✋', '🖖', '👌', '🤌', '🤏', '✌️',
  '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇',
  '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏',
  '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '✍️', '💪',
  '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🔥', '⭐',
  '🌟', '✨', '⚡', '☀️', '🌈', '☕', '🍕', '🍔',
  '🍟', '🍰', '🎂', '🍺', '🍻', '🥂', '⚽', '🏀',
  '🎮', '🎵', '🎧', '📌', '✅', '❌', '⚠️', '❗',
  '❓', '💡', '🎯', '🚀', '👑', '💎',
];
