import React, { useState } from 'react';
import { EVIDENCE_DEFS, EvidenceId } from '../game/evidence';
import { useLanguage } from '../i18n';
import { BidiText } from './BidiText';

interface ResearchJournalProps {
  discoveredIds: EvidenceId[];
  onClose: () => void;
}

type JournalFilter = 'all' | 'collected';

export const ResearchJournal: React.FC<ResearchJournalProps> = ({
  discoveredIds,
  onClose,
}) => {
  const { t, isRtl, dir } = useLanguage();
  const [filter, setFilter] = useState<JournalFilter>('all');

  const discoveredSet = new Set<EvidenceId>(discoveredIds);
  const discoveredCount = discoveredIds.length;
  const totalCount = EVIDENCE_DEFS.length;

  const visibleEntries =
    filter === 'collected'
      ? EVIDENCE_DEFS.filter((entry) => discoveredSet.has(entry.id))
      : EVIDENCE_DEFS;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('journal.dialogAria')}
      data-testid="journal-modal"
      dir={dir}
      className="fixed inset-0 z-30 flex items-center justify-center p-4 md:p-6 bg-[#03070b]/88"
    >
      <div className="w-full max-w-2xl max-h-[88vh] flex flex-col bg-[#071018] border border-sky-400/45 shadow-2xl text-start">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-700/80 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-mono tracking-[0.22em] text-sky-300/85 uppercase">
              <bdi dir="ltr">{t('journal.header')}</bdi>
            </span>
            <span
              data-testid="journal-count"
              data-ar-text={isRtl ? 'true' : undefined}
              className={`text-xs font-mono text-slate-300 ${
                isRtl ? 'tracking-normal' : 'tracking-[0.14em] uppercase'
              }`}
            >
              {t('journal.countLabel')}:{' '}
              <bdi dir="ltr" className="text-sky-300 font-semibold">
                {discoveredCount}/{totalCount}
              </bdi>
            </span>
          </div>

          <h2
            data-ar-text={isRtl ? 'true' : undefined}
            className={`text-xl md:text-2xl font-mono font-semibold text-slate-100 ${
              isRtl ? 'tracking-normal' : 'tracking-[0.16em] uppercase'
            }`}
          >
            {t('journal.title')}
          </h2>

          {/* Filter Tabs */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              data-testid="journal-tab-all"
              data-ar-text={isRtl ? 'true' : undefined}
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 border text-xs font-mono cursor-pointer transition-colors ${
                filter === 'all'
                  ? 'bg-sky-500/20 border-sky-300/70 text-sky-100'
                  : 'bg-[#050b11] border-slate-700 text-slate-400 hover:text-slate-200'
              } ${isRtl ? 'tracking-normal' : 'tracking-[0.14em] uppercase'}`}
            >
              {t('journal.tabAll')} (
              <bdi dir="ltr">{totalCount}</bdi>)
            </button>
            <button
              type="button"
              data-testid="journal-tab-collected"
              data-ar-text={isRtl ? 'true' : undefined}
              onClick={() => setFilter('collected')}
              className={`px-3.5 py-1.5 border text-xs font-mono cursor-pointer transition-colors ${
                filter === 'collected'
                  ? 'bg-sky-500/20 border-sky-300/70 text-sky-100'
                  : 'bg-[#050b11] border-slate-700 text-slate-400 hover:text-slate-200'
              } ${isRtl ? 'tracking-normal' : 'tracking-[0.14em] uppercase'}`}
            >
              {t('journal.tabCollected')} (
              <bdi dir="ltr">{discoveredCount}</bdi>)
            </button>
          </div>
        </div>

        {/* Scrollable Evidence List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3.5">
          {discoveredCount === 0 && (
            <div
              data-testid="journal-empty-state"
              data-ar-text={isRtl ? 'true' : undefined}
              className="border border-slate-700/80 bg-[#050c13] p-5 text-start"
            >
              <div
                className={`text-sm font-mono font-semibold text-slate-200 mb-1.5 ${
                  isRtl ? 'tracking-normal' : 'tracking-[0.14em] uppercase'
                }`}
              >
                {t('journal.emptyTitle')}
              </div>
              <p
                className={`text-xs md:text-sm text-slate-400 ${
                  isRtl ? 'leading-[1.8]' : 'leading-relaxed'
                }`}
              >
                <BidiText text={t('journal.emptyDesc')} />
              </p>
            </div>
          )}

          {visibleEntries.map((entry, idx) => {
            const isDiscovered = discoveredSet.has(entry.id);

            if (!isDiscovered) {
              return (
                <article
                  key={entry.id}
                  data-testid={`evidence-locked-${entry.id}`}
                  data-ar-text={isRtl ? 'true' : undefined}
                  className="border border-slate-800/90 border-s-2 border-s-slate-600 bg-[#050a10]/90 p-4 opacity-80"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <bdi
                      dir="ltr"
                      className="text-[11px] font-mono text-slate-500 tracking-[0.18em]"
                    >
                      LOG-0{idx + 1}
                    </bdi>
                    <span
                      className={`px-2 py-0.5 border border-slate-700 bg-slate-900/70 text-[10px] font-mono text-slate-400 ${
                        isRtl ? 'tracking-normal' : 'tracking-[0.16em] uppercase'
                      }`}
                    >
                      {t('journal.statusUndiscovered')}
                    </span>
                  </div>
                  <h3
                    className={`text-sm font-mono font-medium text-slate-400 ${
                      isRtl ? 'tracking-normal' : 'tracking-[0.12em] uppercase'
                    }`}
                  >
                    <BidiText text={t('journal.undiscoveredTitle')} />
                  </h3>
                  <p
                    className={`text-xs text-slate-500 mt-1 ${
                      isRtl ? 'leading-[1.75]' : 'leading-relaxed'
                    }`}
                  >
                    <BidiText text={t('journal.undiscoveredHint')} />
                  </p>
                </article>
              );
            }

            return (
              <article
                key={entry.id}
                data-testid={`evidence-card-${entry.id}`}
                data-ar-text={isRtl ? 'true' : undefined}
                className="border border-sky-400/30 border-s-2 border-s-sky-400 bg-[#08131d] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <bdi
                    dir="ltr"
                    className="text-[11px] font-mono text-sky-300/90 tracking-[0.18em]"
                  >
                    {entry.code}
                  </bdi>
                  <span
                    className={`px-2 py-0.5 border border-emerald-400/40 bg-emerald-500/10 text-[10px] font-mono text-emerald-300 ${
                      isRtl ? 'tracking-normal' : 'tracking-[0.16em] uppercase'
                    }`}
                  >
                    {t('journal.statusDiscovered')}
                  </span>
                </div>

                <h3
                  className={`text-sm md:text-base font-mono font-semibold text-slate-100 mb-1 ${
                    isRtl ? 'tracking-normal' : 'tracking-[0.1em] uppercase'
                  }`}
                >
                  <BidiText text={t(entry.titleKey)} />
                </h3>

                <div className="text-[11px] font-mono text-slate-400 mb-2.5">
                  <span>{t('journal.sourceLabel')} </span>
                  <span className="text-slate-300">
                    <BidiText text={t(entry.sourceKey)} />
                  </span>
                </div>

                <p
                  className={`text-xs md:text-sm text-slate-200 ${
                    isRtl ? 'leading-[1.85]' : 'leading-relaxed'
                  }`}
                >
                  <BidiText text={t(entry.bodyKey)} />
                </p>
              </article>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-[#060d15]">
          <span
            data-ar-text={isRtl ? 'true' : undefined}
            className={`text-xs font-mono text-slate-400 ${
              isRtl ? 'tracking-normal' : 'tracking-[0.14em] uppercase'
            }`}
          >
            <BidiText text={t('journal.closeHint')} />
          </span>
          <button
            type="button"
            data-testid="journal-close-btn"
            data-ar-text={isRtl ? 'true' : undefined}
            onClick={onClose}
            className={`px-5 py-2 bg-sky-500/15 hover:bg-sky-400/25 border border-sky-300/60 text-xs font-mono text-slate-100 cursor-pointer ${
              isRtl ? 'tracking-normal font-medium' : 'tracking-[0.2em] uppercase'
            }`}
          >
            {t('journal.closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
