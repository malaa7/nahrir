import { create } from 'zustand';
import { translations } from '../i18n/translations';

const KEY = 'nahrir-settings';

const loadLang = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
    const s = JSON.parse(raw);
    return s.language || 'ar';
    }
  } catch {}
  return 'ar';
};

const saveLang = (lang) => {
  try {
    const raw = localStorage.getItem(KEY);
    const s = raw ? JSON.parse(raw) : {};
    s.language = lang;
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
};

const applyLang = (lang) => {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
};

export const useLangStore = create((set, get) => {
  const initial = loadLang();
  applyLang(initial);

  return {
    language: initial,
    setLanguage: (l) => {
    applyLang(l);
    saveLang(l);
    set({ language: l });
    },
    t: (key) => translations[get().language]?.[key] || key,
  };
});
