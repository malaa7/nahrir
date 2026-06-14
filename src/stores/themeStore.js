import { create } from 'zustand';
const KEY = 'nahrir-settings';

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveSettings = (s) => localStorage.setItem(KEY, JSON.stringify(s));

export const useThemeStore = create((set, get) => {
  const saved = loadSettings();
  const initial = saved.theme || 'dark';
  document.documentElement.setAttribute('data-theme', initial);

  return {
    theme: initial,
    setTheme: (t) => {
    document.documentElement.setAttribute('data-theme', t);
    const s = loadSettings();
    s.theme = t;
    saveSettings(s);
    set({ theme: t });
    },
    toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
    },
  };
});
