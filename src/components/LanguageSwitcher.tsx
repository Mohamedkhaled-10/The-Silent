import React from 'react';
import { Locale, useLanguage } from '../i18n';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  compact = false,
}) => {
  const { locale, setLocale, t } = useLanguage();

  const handleSelect = (
    next: Locale,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.currentTarget.blur();
    setLocale(next);
  };

  if (compact) {
    const nextLocale: Locale = locale === 'en' ? 'ar' : 'en';
    return (
      <button
        type="button"
        tabIndex={-1}
        data-testid="hud-lang-toggle"
        aria-label={t('lang.toggleAria')}
        onClick={(e) => handleSelect(nextLocale, e)}
        className="h-10 px-2.5 flex items-center justify-center bg-[#060c14]/85 hover:bg-[#0d1826] border border-slate-600/60 text-xs font-mono text-slate-200 cursor-pointer transition-colors"
        title={t('lang.toggleAria')}
      >
        <span dir={nextLocale === 'ar' ? 'rtl' : 'ltr'}>
          {nextLocale === 'ar' ? 'العربية' : 'EN'}
        </span>
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      data-testid="language-selector"
      className="inline-flex items-center border border-slate-600/70 bg-[#060c14]/90"
    >
      <button
        type="button"
        data-testid="lang-btn-en"
        aria-pressed={locale === 'en'}
        onClick={(e) => handleSelect('en', e)}
        dir="ltr"
        className={`px-3 py-1.5 text-xs font-mono tracking-[0.12em] uppercase transition-colors cursor-pointer ${
          locale === 'en'
            ? 'bg-sky-500/25 text-sky-200 border-e border-sky-400/50'
            : 'text-slate-400 hover:text-slate-200 border-e border-slate-700/70'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        data-testid="lang-btn-ar"
        aria-pressed={locale === 'ar'}
        onClick={(e) => handleSelect('ar', e)}
        dir="rtl"
        className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
          locale === 'ar'
            ? 'bg-sky-500/25 text-sky-200'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        العربية
      </button>
    </div>
  );
};
