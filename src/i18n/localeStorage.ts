import { Locale, TranslationKey, translations } from './translations';

export const LOCALE_STORAGE_KEY = 'the_silence_locale';

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export function isValidLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'ar';
}

/**
 * Resolves initial locale following strict precedence:
 * 1. Explicit URL query override (?lang=ar or ?lang=en) when valid
 * 2. Saved preference in localStorage
 * 3. Browser primary preferred language (Arabic when primary locale starts with "ar")
 * 4. Default English ("en")
 */
export function detectInitialLocale(options?: {
  storage?: StorageLike | null;
  languages?: readonly string[] | null;
  language?: string | null;
  search?: string | null;
}): Locale {
  if (options?.search) {
    try {
      const params = new URLSearchParams(options.search);
      const urlLang = params.get('lang');
      if (isValidLocale(urlLang)) {
        return urlLang;
      }
    } catch {
      // Ignore malformed query string
    }
  }

  try {
    const saved = options?.storage?.getItem(LOCALE_STORAGE_KEY);
    if (isValidLocale(saved)) {
      return saved;
    }
  } catch {
    // Ignore restricted storage access
  }

  const primary =
    options?.languages && options.languages.length > 0
      ? options.languages[0]
      : options?.language ?? '';

  if (typeof primary === 'string' && primary.trim().toLowerCase().startsWith('ar')) {
    return 'ar';
  }

  return 'en';
}

export function saveLocalePreference(
  locale: Locale,
  storage?: StorageLike | null
): void {
  try {
    storage?.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore storage quota/privacy mode errors
  }
}

/**
 * Translates a key for the given locale with a safe fallback to English,
 * and finally to the key string itself if absent from both dictionaries.
 */
export function translateKey(
  locale: Locale,
  key: TranslationKey | string,
  customDictionaries: Record<Locale, Record<string, string>> = translations
): string {
  const activeDict = customDictionaries[locale];
  if (activeDict && Object.prototype.hasOwnProperty.call(activeDict, key)) {
    const value = activeDict[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  const fallbackDict = customDictionaries.en;
  if (fallbackDict && Object.prototype.hasOwnProperty.call(fallbackDict, key)) {
    return fallbackDict[key];
  }
  return String(key);
}
