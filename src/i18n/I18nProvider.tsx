import { createContext, useContext, useState, ReactNode } from 'react';
import trMessages from './messages/tr.json';
import enMessages from './messages/en.json';

export type Language = 'tr' | 'en';
export type TranslationKey = keyof typeof trMessages;

const messages: Record<Language, Record<string, string>> = {
  tr: trMessages,
  en: enMessages,
};

interface I18nContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey | string) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

const STORAGE_KEY = 'app_lang';

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    return saved === 'en' || saved === 'tr' ? saved : 'tr';
  });

  const setLang = (newLang: Language) => {
    localStorage.setItem(STORAGE_KEY, newLang);
    setLangState(newLang);
  };

  const t = (key: TranslationKey | string): string => {
    return messages[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextProps => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
