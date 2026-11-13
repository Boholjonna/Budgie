export type CategoryKey =
  | 'food'
  | 'transport'
  | 'school'
  | 'shopping'
  | 'health'
  | 'leisure'
  | 'others'
  | string; // Allow custom category keys

export interface Category {
  key: CategoryKey;
  label: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { key: 'food',      label: 'Food',      emoji: '🍔', color: '#FF6B6B' },
  { key: 'transport', label: 'Transport', emoji: '🚌', color: '#4ECDC4' },
  { key: 'school',    label: 'School',    emoji: '📚', color: '#45B7D1' },
  { key: 'shopping',  label: 'Shopping',  emoji: '🛍️', color: '#F7B731' },
  { key: 'health',    label: 'Health',    emoji: '💊', color: '#A29BFE' },
  { key: 'leisure',   label: 'Leisure',   emoji: '🎮', color: '#FD79A8' },
  { key: 'others',    label: 'Others',    emoji: '📦', color: '#B2BEC3' },
];

export const getCategoryByKey = (key: CategoryKey, customCategories: Category[] = []): Category => {
  const allCategories = [...CATEGORIES, ...customCategories];
  return allCategories.find((c) => c.key === key) ?? CATEGORIES[6];
};
