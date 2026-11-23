import React from 'react';
import { useLanguage } from '../i18n';
import { BidiText } from './BidiText';
import { LanguageSwitcher } from './LanguageSwitcher';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const { t, isRtl, dir } = useLanguage();

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-20 flex flex-col justify-between p-8 md:p-14 bg-[#04080d]/65"
    >
      {/* Top subtle clinical designation + Language Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div
          data-ar-text={isRtl ? 'true' : undefined}
          className={`flex flex-wrap items-center gap-6 ${
            isRtl ? 'tracking-normal' : 'tracking-[0.26em] uppercase'
          }`}
        >
          <span>
            <BidiText text={t('title.milestone')} />
          </span>
          <span className="text-slate-500">
            <BidiText text={t('title.sector')} />
          </span>
        </div>

        <LanguageSwitcher />
      </div>

      {/* Main Asymmetric Title Lockup over calm dark negative space */}
      <div className="max-w-xl my-auto text-start">
        <div className="flex items-center gap-4 mb-5">
          {/* Custom inline SVG emblem: neural aperture / observation window */}
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect
              x="2"
              y="2"
              width="40"
              height="40"
              stroke="#7dd3fc"
              strokeOpacity="0.45"
              strokeWidth="1.5"
            />
            <circle
              cx="22"
              cy="22"
              r="11"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            <line
              x1="22"
              y1="5"
              x2="22"
              y2="14"
              stroke="#7dd3fc"
              strokeWidth="1.5"
            />
            <line
              x1="22"
              y1="30"
              x2="22"
              y2="39"
              stroke="#7dd3fc"
              strokeWidth="1.5"
            />
            <circle cx="22" cy="22" r="2.5" fill="#ef4444" />
          </svg>
          <bdi
            dir="ltr"
            className="text-xs font-mono tracking-[0.32em] text-sky-300/90 uppercase"
          >
            {t('title.project')}
          </bdi>
        </div>

        <h1 className="text-5xl md:text-6xl font-semibold tracking-[0.18em] text-slate-100 uppercase leading-none mb-5">
          <bdi dir="ltr">{t('title.gameTitle')}</bdi>
        </h1>

        <p
          data-ar-text={isRtl ? 'true' : undefined}
          className={`text-sm md:text-base text-slate-300/90 font-normal max-w-md mb-8 ${
            isRtl ? 'leading-[1.8]' : 'leading-relaxed'
          }`}
        >
          <BidiText text={t('title.subtitle')} />
        </p>

        <button
          type="button"
          data-start="true"
          data-ar-text={isRtl ? 'true' : undefined}
          onClick={onStart}
          className={`px-7 py-3.5 bg-sky-500/15 hover:bg-sky-400/25 active:bg-sky-400/30 border border-sky-300/60 text-slate-50 font-mono text-sm transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
            isRtl
              ? 'tracking-normal font-semibold'
              : 'tracking-[0.22em] uppercase'
          }`}
        >
          {t('title.startCta')}
        </button>
      </div>

      {/* Single flat control-hint line in bottom safe margin with LTR key badges */}
      <div
        data-ar-text={isRtl ? 'true' : undefined}
        className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-400 ${
          isRtl ? 'tracking-normal' : 'tracking-[0.16em] uppercase'
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <bdi dir="ltr" className="text-slate-200">
            WASD
          </bdi>
          <span>{t('controls.move')}</span>
        </span>
        <span aria-hidden="true">&middot;</span>
        <span className="inline-flex items-center gap-1.5">
          <bdi dir="ltr" className="text-slate-200">
            {t('controls.keyMouse')}
          </bdi>
          <span>{t('controls.look')}</span>
        </span>
        <span aria-hidden="true">&middot;</span>
        <span className="inline-flex items-center gap-1.5">
          <bdi dir="ltr" className="text-slate-200">
            E
          </bdi>
          <span>{t('controls.interact')}</span>
        </span>
        <span aria-hidden="true">&middot;</span>
        <span className="inline-flex items-center gap-1.5">
          <bdi dir="ltr" className="text-slate-200">
            F
          </bdi>
          <span>{t('controls.flashlight')}</span>
        </span>
        <span aria-hidden="true">&middot;</span>
        <span className="inline-flex items-center gap-1.5">
          <bdi dir="ltr" className="text-slate-200">
            J
          </bdi>
          <span>{t('controls.journal')}</span>
        </span>
        <span aria-hidden="true">&middot;</span>
        <span className="inline-flex items-center gap-1.5">
          <bdi dir="ltr" className="text-slate-200">
            {t('controls.keyEsc')}
          </bdi>
          <span>{t('controls.pause')}</span>
        </span>
      </div>
    </div>
  );
};
