import type { EmojiMartData } from '@emoji-mart/data';

// The picker is powered by the full Unicode emoji dataset from
// `@emoji-mart/data` (1,800+ emojis with names and search keywords). The JSON
// is imported lazily, so it becomes its own chunk and only downloads the first
// time an employee opens the emoji picker.
export interface PickerEmoji {
  native: string;
  name: string;
  id: string;
  categoryId: string;
  /** Pre-built lowercase haystack for the search box. */
  search: string;
}

export interface PickerCategory {
  id: string;
  label: string;
  emojis: PickerEmoji[];
}

export const PICKER_CATEGORY_LABELS: Record<string, string> = {
  people: 'Smileys & People',
  nature: 'Animals & Nature',
  foods: 'Food & Drink',
  activity: 'Activities & Sports',
  places: 'Travel & Places',
  objects: 'Objects',
  symbols: 'Symbols',
  flags: 'Flags',
};

let cache: Promise<PickerCategory[]> | null = null;

const normalize = (raw: EmojiMartData): PickerCategory[] => {
  const categories: PickerCategory[] = [];

  raw.categories.forEach(category => {
    const label = PICKER_CATEGORY_LABELS[category.id];
    if (!label) return;

    const emojis: PickerEmoji[] = [];

    category.emojis.forEach(id => {
      const emoji = raw.emojis[id];
      const native = emoji?.skins?.[0]?.native;
      if (!native) return;

      emojis.push({
        id,
        native,
        name: emoji.name,
        categoryId: category.id,
        search: [emoji.name, id.replace(/[_-]/g, ' '), ...(emoji.keywords ?? [])]
          .join(' ')
          .toLowerCase(),
      });
    });

    if (emojis.length) categories.push({ id: category.id, label, emojis });
  });

  return categories;
};

export const loadEmojiCategories = (): Promise<PickerCategory[]> => {
  if (!cache) {
    cache = import('@emoji-mart/data')
      .then(module => {
        const data = ((module as unknown as { default?: EmojiMartData }).default ??
          (module as unknown as EmojiMartData)) as EmojiMartData;
        return normalize(data);
      })
      .catch(error => {
        // Let a later attempt retry instead of caching the failure forever.
        cache = null;
        throw error;
      });
  }
  return cache;
};
