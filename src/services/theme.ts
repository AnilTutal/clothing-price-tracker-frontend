import { useSyncExternalStore } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'app_theme';
const EVENT = 'theme-changed';

function getStoredTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'dark' || raw === 'light') return raw;
  } catch {
    // localStorage erişilemezse varsayılan tema
  }
  return 'light';
}

let currentTheme: ThemeMode = getStoredTheme();

function applyThemeToDocument(theme: ThemeMode) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// Modül ilk yüklendiğinde temayı hemen uygula
applyThemeToDocument(currentTheme);

function read(): ThemeMode {
  return currentTheme;
}

export function setTheme(next: ThemeMode) {
  currentTheme = next;
  applyThemeToDocument(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // localStorage kapalıysa yalnızca bellekte tut
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      currentTheme = getStoredTheme();
      applyThemeToDocument(currentTheme);
      callback();
    }
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  return { theme, setTheme, toggleTheme };
}
