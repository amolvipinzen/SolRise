import { ThemeId } from '../types';

export const THEMES: { id: ThemeId; name: string; tagline: string; swatch: [string, string, string] }[] = [
  { id: 'sunrise', name: 'Sunrise', tagline: 'Warm, hopeful, golden', swatch: ['#FFF7EE', '#F26B3A', '#F5B83D'] },
  { id: 'lavender', name: 'Lavender', tagline: 'Soft, calm, dreamy', swatch: ['#F7F4FF', '#7C5CE0', '#F2B84B'] },
  { id: 'ocean', name: 'Ocean', tagline: 'Clear, fresh, focused', swatch: ['#F1F8FB', '#1A88B5', '#2EC4B6'] },
  { id: 'forest', name: 'Forest', tagline: 'Grounded, steady, green', swatch: ['#F3F6EF', '#3B8558', '#D9A441'] },
  { id: 'midnight', name: 'Midnight', tagline: 'Dark, cozy, starry', swatch: ['#0F1022', '#8B7CFF', '#FFC857'] },
];

const STORAGE_KEY = 'solrise_theme';

export const readStoredTheme = (): ThemeId => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (stored && THEMES.some(t => t.id === stored)) return stored;
  } catch {
    // storage blocked
  }
  return 'sunrise';
};

export const applyTheme = (theme: ThemeId) => {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEMES.find(t => t.id === theme)!.swatch[0]);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage blocked
  }
};
