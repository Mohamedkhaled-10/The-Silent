import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  detectInitialLocale,
  saveLocalePreference,
  translateKey,
} from './localeStorage';
import { Locale, TranslationKey } from './translations';

interface LanguageContextValue {
  locale: Locale;
  isRtl: boolean;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    return detectInitialLocale({
      storage: window.localStorage,
      languages: window.navigator?.languages,
      language: window.navigator?.language,
      search: window.location.search,
    });
  });

  const isRtl = locale === 'ar';
  const dir: 'ltr' | 'rtl' = isRtl ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      saveLocalePreference(next, window.localStorage);
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next: Locale = prev === 'en' ? 'ar' : 'en';
      if (typeof window !== 'undefined') {
        saveLocalePreference(next, window.localStorage);
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translateKey(locale, key),
    [locale]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      isRtl,
      dir,
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, isRtl, dir, setLocale, toggleLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
