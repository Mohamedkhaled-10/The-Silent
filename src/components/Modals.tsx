import React, { useEffect, useState } from 'react';
import { EvidenceId } from '../game/evidence';
import {
  ARCHIVED_RECORD_PARAGRAPH_KEYS,
  MEMORY_CONSOLE_LINE_DEFS,
  TERMINAL_LINE_DEFS,
} from '../game/facilityData';
import { ActiveModal, GamePhase } from '../game/types';
import { useLanguage } from '../i18n';
import { BidiText } from './BidiText';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ResearchJournal } from './ResearchJournal';

interface ModalsProps {
  phase: GamePhase;
  modal: ActiveModal;
  discoveredEvidenceIds: EvidenceId[];
  memoryFragmentCompleted: boolean;
  onCloseModal: () => void;
  onInitializeReconstruction: () => void;
  onResume: () => void;
  onRestart: () => void;
  onReturnToTitle: () => void;
}

export const Modals: React.FC<ModalsProps> = ({
  phase,
  modal,
  discoveredEvidenceIds,
  memoryFragmentCompleted,
  onCloseModal,
  onInitializeReconstruction,
  onResume,
  onRestart,
  onReturnToTitle,
}) => {
  const { t, isRtl, dir } = useLanguage();
  const [confirmingMemory, setConfirmingMemory] = useState(false);

  useEffect(() => {
    if (modal !== 'memoryConsole') {
      setConfirmingMemory(false);
    }
  }, [modal]);

  // 1. Research Terminal Interface
  if (phase === 'playing' && modal === 'terminal') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('terminal.dialogAria')}
        dir={dir}
        className="fixed inset-0 z-30 flex items-center justify-center p-6 bg-[#03070b]/85"
      >
        <div className="w-full max-w-xl bg-[#051018] border border-sky-400/50 shadow-2xl p-7 md:p-9 font-mono text-start">
          <div
            data-ar-text={isRtl ? 'true' : undefined}
            className={`flex flex-wrap items-center justify-between gap-2 border-b border-sky-400/25 pb-3 mb-6 text-xs text-sky-300/80 ${
              isRtl ? 'tracking-normal' : 'tracking-[0.22em] uppercase'
            }`}
          >
            <span>
              <BidiText text={t('terminal.unit')} />
            </span>
            <span>{t('terminal.statusOnline')}</span>
          </div>

          <div
            data-ar-text={isRtl ? 'true' : undefined}
            className={`space-y-3 text-sm md:text-base ${
              isRtl ? 'tracking-normal leading-[1.75]' : 'tracking-[0.14em]'
            }`}
          >
            {TERMINAL_LINE_DEFS.map((lineDef) => {
              const text = t(lineDef.key);
              const isEnglishBrand =
                lineDef.key === 'terminal.project' ||
                lineDef.key === 'terminal.subject';
              const className =
                lineDef.variant === 'header'
                  ? `text-sky-300 font-semibold text-base md:text-lg ${
                      isRtl && !isEnglishBrand
                        ? 'tracking-normal'
                        : 'tracking-[0.2em]'
                    }`
                  : lineDef.variant === 'alert'
                    ? 'text-red-400 font-medium'
                    : 'text-slate-100';

              return (
                <div key={lineDef.key} className={className}>
                  {isEnglishBrand ? (
                    <bdi dir="ltr">{text}</bdi>
                  ) : (
                    <BidiText text={text} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-sky-400/20 flex flex-wrap items-center justify-between gap-3">
            <span
              data-ar-text={isRtl ? 'true' : undefined}
              className={`text-xs text-slate-400 ${
                isRtl ? 'tracking-normal' : 'tracking-[0.14em] uppercase'
              }`}
            >
              <BidiText text={t('terminal.closeHint')} />
            </span>
            <button
              type="button"
              data-ar-text={isRtl ? 'true' : undefined}
              onClick={onCloseModal}
              className={`px-5 py-2 bg-sky-500/15 hover:bg-sky-400/25 border border-sky-300/60 text-xs text-slate-100 cursor-pointer ${
                isRtl ? 'tracking-normal font-medium' : 'tracking-[0.2em] uppercase'
              }`}
            >
              {t('terminal.closeBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Archived Research Record (SUBJECT 012)
  if (phase === 'playing' && modal === 'record') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('record.dialogAria')}
        dir={dir}
        className="fixed inset-0 z-30 flex items-center justify-center p-6 bg-[#03070b]/85"
      >
        <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0b1219] border border-slate-500/50 shadow-2xl p-7 md:p-9 text-start">
          <div
            data-ar-text={isRtl ? 'true' : undefined}
            className={`flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3 mb-5 text-xs font-mono text-slate-400 ${
              isRtl ? 'tracking-normal' : 'tracking-[0.2em] uppercase'
            }`}
          >
            <span>{t('record.classification')}</span>
            <bdi dir="ltr" className="text-red-400">
              {t('record.fileId')}
            </bdi>
          </div>

          <div className="text-xs font-mono tracking-[0.22em] text-sky-300/90 uppercase mb-1">
            <bdi dir="ltr">{t('record.program')}</bdi>
          </div>
          <h2
            data-ar-text={isRtl ? 'true' : undefined}
            className={`text-lg md:text-xl font-mono font-semibold text-slate-100 mb-5 ${
              isRtl ? 'tracking-normal leading-relaxed' : 'tracking-[0.12em] uppercase'
            }`}
          >
            <BidiText text={t('record.title')} />
          </h2>

          <p
            data-ar-text={isRtl ? 'true' : undefined}
            className={`text-sm text-slate-200 mb-4 ${
              isRtl ? 'leading-[1.8]' : 'leading-relaxed'
            }`}
          >
            <BidiText text={t('record.summary')} />
          </p>

          <div
            data-ar-text={isRtl ? 'true' : undefined}
            className={`space-y-3 text-sm text-slate-300 ${
              isRtl ? 'leading-[1.85]' : 'leading-relaxed'
            }`}
          >
            {ARCHIVED_RECORD_PARAGRAPH_KEYS.map((key) => (
              <p key={key}>
                <BidiText text={t(key)} />
              </p>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
            <span
              data-ar-text={isRtl ? 'true' : undefined}
              className={`text-[11px] font-mono text-slate-400 ${
                isRtl ? 'tracking-normal' : 'tracking-[0.16em] uppercase'
              }`}
            >
              {t('record.footerNote')}
            </span>
            <button
              type="button"
              data-ar-text={isRtl ? 'true' : undefined}
              onClick={onCloseModal}
              className={`shrink-0 px-5 py-2 bg-slate-700/40 hover:bg-slate-600/50 border border-slate-400/50 text-xs font-mono text-slate-100 cursor-pointer ${
                isRtl ? 'tracking-normal font-medium' : 'tracking-[0.2em] uppercase'
              }`}
            >
              {t('record.closeBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Research Journal (J)
  if (phase === 'playing' && modal === 'journal') {
    return (
      <ResearchJournal
        discoveredIds={discoveredEvidenceIds}
        onClose={onCloseModal}
      />
    );
  }

  // 4. Neural Scan Monitor (Memory Analysis Wing Secondary)
  if (phase === 'playing' && modal === 'neuralScan') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('neuralScan.dialogAria')}
        dir={dir}
        className="fixed inset-0 z-30 flex items-center justify-center p-6 bg-[#03070b]/85"
      >
        <div className="w-full max-w-xl max-h-[88vh] overflow-y-auto bg-[#051118] border border-teal-400/50 shadow-2xl p-7 md:p-9 font-mono text-start">
          <div
            data-ar-text={isRtl ? 'true' : undefined}
            className={`flex flex-wrap items-center justify-between gap-2 border-b border-teal-400/25 pb-3 mb-5 text-xs text-teal-300/85 ${
              isRtl ? 'tracking-normal' : 'tracking-[0.2em] uppercase'
            }`}
          >
            <span>
              <BidiText text={t('neuralScan.unit')} />
            </span>
            <span>{t('neuralScan.status')}</span>
          </div>

          <h2
            data-ar-text={isRtl ? 'true' : undefined}
            className={`text-base md:text-lg font-semibold text-slate-100 mb-4 ${
              isRtl ? 'tracking-normal leading-relaxed' : 'tracking-[0.14em] uppercase'
            }`}
          >
            <BidiText text={t('neuralScan.title')} />
          </h2>

          <div
            data-ar-text={isRtl ? 'true' : undefined}
            className={`space-y-3 font-sans text-sm text-slate-200 ${
              isRtl ? 'leading-[1.85]' : 'leading-relaxed'
            }`}
          >
            <p>
              <BidiText text={t('neuralScan.p1')} />
            </p>
            <p className="text-slate-300">
              <BidiText text={t('neuralScan.p2')} />
            </p>
          </div>

          <div className="mt-7 pt-4 border-t border-teal-400/20 flex flex-wrap items-center justify-between gap-3">
            <span
              data-ar-text={isRtl ? 'true' : undefined}
              className={`text-xs text-slate-400 ${
                isRtl ? 'tracking-normal' : 'tracking-[0.14em] uppercase'
              }`}
            >
              <BidiText text={t('terminal.closeHint')} />
            </span>
            <button
              type="button"
              data-ar-text={isRtl ? 'true' : undefined}
              onClick={onCloseModal}
              className={`px-5 py-2 bg-teal-500/15 hover:bg-teal-400/25 border border-teal-300/60 text-xs text-slate-100 cursor-pointer ${
                isRtl ? 'tracking-normal font-medium' : 'tracking-[0.2em] uppercase'
              }`}
            >
              {t('neuralScan.closeBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Subject 047 Session Report (Memory Analysis Wing Secondary)
  if (phase === 'playing' && modal === 'sessionReport') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('sessionReport.dialogAria')}
        dir={dir}
        className="fixed inset-0 z-30 flex items-center justify-center p-6 bg-[#03070b]/85"
      >
        <div className="w-full max-w-xl max-h-[88vh] overflow-y-auto bg-[#0b1219] border border-slate-500/55 shadow-2xl p-7 md:p-9 text-start">
          <div
            data-ar-text={isRtl ? 'true' : undefined}
            className={`flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3 mb-5 text-xs font-mono text-slate-400 ${
              isRtl ? 'tracking-normal' : 'tracking-[0.18em] uppercase'
            }`}
          >
            <span>{t('sessionReport.classification')}</span>
            <bdi dir="ltr" className="text-amber-300">
              {t('sessionReport.fileId')}
            </bdi>
          </div>

          <div className="text-xs font-mono tracking-[0.22em] text-sky-300/90 uppercase mb-1">
            <bdi dir="ltr">{t('record.program')}</bdi>
          </div>
          <h2
            data-ar-text={isRtl ? 'true' : undefined}
            className={`text-lg md:text-xl font-mono font-semibold text-slate-100 mb-4 ${
              isRtl ? 'tracking-normal leading-relaxed' : 'tracking-[0.12em] uppercase'
            }`}
          >
            <BidiText text={t('sessionReport.title')} />
          </h2>

          <div
            data-ar-text={isRtl ? 'true' : undefined}
            className={`space-y-3 text-sm text-slate-200 ${
              isRtl ? 'leading-[1.85]' : 'leading-relaxed'
            }`}
          >
            <p>
              <BidiText text={t('sessionReport.p1')} />
            </p>
            <p className="text-slate-300">
              <BidiText text={t('sessionReport.p2')} />
            </p>
          </div>

          <div className="mt-7 pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
            <span
              data-ar-text={isRtl ? 'true' : undefined}
              className={`text-xs font-mono text-slate-400 ${
                isRtl ? 'tracking-normal' : 'tracking-[0.14em] uppercase'
              }`}
            >
              <BidiText text={t('terminal.closeHint')} />
            </span>
            <button
              type="button"
              data-ar-text={isRtl ? 'true' : undefined}
              onClick={onCloseModal}
              className={`px-5 py-2 bg-slate-700/40 hover:bg-slate-600/50 border border-slate-400/50 text-xs font-mono text-slate-100 cursor-pointer ${
                isRtl ? 'tracking-normal font-medium' : 'tracking-[0.2em] uppercase'
              }`}
            >
              {t('sessionReport.closeBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 6. Central Memory Analysis Console (Milestone 03 Readout -> Milestone 04 Confirmation & Post-Session Status)
  if (phase === 'playing' && modal === 'memoryConsole') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('memoryConsole.dialogAria')}
        data-testid="memory-console-modal"
        dir={dir}
        className="fixed inset-0 z-30 flex items-center justify-center p-6 bg-[#03070b]/88"
      >
        <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#051119] border border-sky-400/60 shadow-2xl p-7 md:p-9 font-mono text-start">
          <div
            data-ar-text={isRtl ? 'true' : undefined}
            className={`flex flex-wrap items-center justify-between gap-2 border-b border-sky-400/25 pb-3 mb-6 text-xs text-sky-300/85 ${
              isRtl ? 'tracking-normal' : 'tracking-[0.2em] uppercase'
            }`}
          >
            <span>
              <BidiText text={t('memoryConsole.unit')} />
            </span>
            <span
              className={
                memoryFragmentCompleted ? 'text-amber-300' : 'text-emerald-300'
              }
            >
              {memoryFragmentCompleted
                ? t('memoryConsole.statusInterrupted')
                : t('memoryConsole.status')}
            </span>
          </div>

          {confirmingMemory ? (
            <div data-testid="memory-confirm-view">
              <div
                data-ar-text={isRtl ? 'true' : undefined}
                className={`space-y-2.5 text-sm md:text-base ${
                  isRtl ? 'tracking-normal leading-[1.75]' : 'tracking-[0.14em]'
                }`}
              >
                <div className="text-sky-300 font-semibold text-base md:text-lg tracking-[0.2em]">
                  <bdi dir="ltr">{t('memoryConsole.project')}</bdi>
                </div>
                <div className="text-sky-300 font-semibold text-base md:text-lg">
                  <BidiText text={t('memoryConsole.reconstructionHeader')} />
                </div>
                <div className="text-slate-100">
                  <bdi dir="ltr">{t('memoryConsole.subject')}</bdi>
                </div>
                <div className="text-emerald-300 font-medium">
                  <BidiText text={t('memoryConsole.availableMemoryData')} />
                </div>
              </div>

              <div
                data-ar-text={isRtl ? 'true' : undefined}
                className={`mt-5 border-s-2 border-amber-400/75 bg-amber-500/8 px-4 py-3 font-sans text-xs md:text-sm text-slate-200 ${
                  isRtl ? 'leading-[1.8]' : 'leading-relaxed'
                }`}
              >
                <BidiText text={t('memoryConsole.confirmWarning')} />
              </div>

              <div className="mt-7 pt-4 border-t border-sky-400/20 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  data-ar-text={isRtl ? 'true' : undefined}
                  onClick={() => setConfirmingMemory(false)}
                  className={`px-5 py-2.5 bg-slate-800/70 hover:bg-slate-700/75 border border-slate-500/60 text-xs text-slate-200 cursor-pointer ${
                    isRtl ? 'tracking-normal font-medium' : 'tracking-[0.18em] uppercase'
                  }`}
                >
                  {t('memoryConsole.cancelBtn')}
                </button>
                <button
                  type="button"
                  data-testid="initialize-reconstruction-btn"
                  data-ar-text={isRtl ? 'true' : undefined}
                  onClick={() => {
                    setConfirmingMemory(false);
                    onInitializeReconstruction();
                  }}
                  className={`px-6 py-2.5 bg-amber-500/20 hover:bg-amber-400/30 border border-amber-300/75 text-xs text-amber-100 font-semibold cursor-pointer ${
                    isRtl ? 'tracking-normal' : 'tracking-[0.2em] uppercase'
                  }`}
                >
                  {t('memoryConsole.confirmBtn')}
                </button>
              </div>
            </div>
          ) : memoryFragmentCompleted ? (
            <div data-testid="memory-post-session-view">
              <div
                data-ar-text={isRtl ? 'true' : undefined}
                className={`space-y-2.5 text-sm md:text-base ${
                  isRtl ? 'tracking-normal leading-[1.75]' : 'tracking-[0.14em]'
                }`}
              >
                <div className="text-sky-300 font-semibold text-base md:text-lg tracking-[0.2em]">
                  <bdi dir="ltr">{t('memoryConsole.project')}</bdi>
                </div>
                <div className="text-sky-300 font-semibold text-base md:text-lg">
                  <BidiText text={t('memoryConsole.reconstructionHeader')} />
                </div>
                <div className="text-slate-100">
                  <bdi dir="ltr">{t('memoryConsole.subject')}</bdi>
                </div>
                <div className="text-slate-100">
                  <bdi dir="ltr">{t('memoryConsole.fragmentLine')}</bdi>
                </div>
                <div className="text-red-400 font-medium">
                  <BidiText text={t('memoryConsole.statusInterruptedLine')} />
                </div>
                <div className="text-amber-300 font-medium">
                  <BidiText text={t('memoryConsole.unexpectedDataLine')} />
                </div>
              </div>

              <div
                data-ar-text={isRtl ? 'true' : undefined}
                className={`mt-5 border-s-2 border-sky-400/70 bg-sky-500/8 px-4 py-3 font-sans text-xs md:text-sm text-slate-200 ${
                  isRtl ? 'leading-[1.8]' : 'leading-relaxed'
                }`}
              >
                <BidiText text={t('memoryConsole.postMemoryNote')} />
              </div>

              <div className="mt-7 pt-4 border-t border-sky-400/20 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  data-testid="reenter-fragment-btn"
                  data-ar-text={isRtl ? 'true' : undefined}
                  onClick={() => setConfirmingMemory(true)}
                  className={`px-4 py-2 bg-slate-800/60 hover:bg-slate-700/70 border border-slate-500/60 text-xs text-slate-200 cursor-pointer ${
                    isRtl ? 'tracking-normal' : 'tracking-[0.16em] uppercase'
                  }`}
                >
                  {t('memoryConsole.reenterBtn')}
                </button>
                <button
                  type="button"
                  data-ar-text={isRtl ? 'true' : undefined}
                  onClick={onCloseModal}
                  className={`px-5 py-2 bg-sky-500/15 hover:bg-sky-400/25 border border-sky-300/60 text-xs text-slate-100 cursor-pointer ${
                    isRtl ? 'tracking-normal font-medium' : 'tracking-[0.2em] uppercase'
                  }`}
                >
                  {t('memoryConsole.closeBtn')}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div
                data-ar-text={isRtl ? 'true' : undefined}
                className={`space-y-2.5 text-sm md:text-base ${
                  isRtl ? 'tracking-normal leading-[1.75]' : 'tracking-[0.14em]'
                }`}
              >
                {MEMORY_CONSOLE_LINE_DEFS.map((lineDef) => {
                  const text = t(lineDef.key);
                  const isEnglishBrand =
                    lineDef.key === 'memoryConsole.project' ||
                    lineDef.key === 'memoryConsole.subject';
                  const className =
                    lineDef.variant === 'header'
                      ? `text-sky-300 font-semibold text-base md:text-lg ${
                          isRtl && !isEnglishBrand
                            ? 'tracking-normal'
                            : 'tracking-[0.2em]'
                        }`
                      : lineDef.variant === 'alert'
                        ? 'text-amber-300 font-medium'
                        : 'text-slate-100';

                  return (
                    <div key={lineDef.key} className={className}>
                      {isEnglishBrand ? (
                        <bdi dir="ltr">{text}</bdi>
                      ) : (
                        <BidiText text={text} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                data-ar-text={isRtl ? 'true' : undefined}
                className={`mt-5 border-s-2 border-amber-400/70 bg-amber-500/5 px-4 py-3 font-sans text-xs md:text-sm text-slate-200 ${
                  isRtl ? 'leading-[1.8]' : 'leading-relaxed'
                }`}
              >
                <BidiText text={t('memoryConsole.archiveHook')} />
              </div>

              <div
                data-ar-text={isRtl ? 'true' : undefined}
                className={`mt-4 border border-emerald-400/35 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-300 ${
                  isRtl ? 'tracking-normal' : 'tracking-[0.12em] uppercase'
                }`}
              >
                <BidiText text={t('memoryConsole.completionNote')} />
              </div>

              <div className="mt-7 pt-4 border-t border-sky-400/20 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  data-ar-text={isRtl ? 'true' : undefined}
                  onClick={onCloseModal}
                  className={`px-4 py-2 bg-slate-800/60 hover:bg-slate-700/70 border border-slate-500/60 text-xs text-slate-200 cursor-pointer ${
                    isRtl ? 'tracking-normal' : 'tracking-[0.16em] uppercase'
                  }`}
                >
                  {t('memoryConsole.closeBtn')}
                </button>
                <button
                  type="button"
                  data-testid="begin-reconstruction-btn"
                  data-ar-text={isRtl ? 'true' : undefined}
                  onClick={() => setConfirmingMemory(true)}
                  className={`px-5 py-2.5 bg-amber-500/20 hover:bg-amber-400/30 border border-amber-300/75 text-xs text-amber-100 font-semibold cursor-pointer ${
                    isRtl ? 'tracking-normal' : 'tracking-[0.2em] uppercase'
                  }`}
                >
                  {t('memoryConsole.beginBtn')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 7. Pause Modal
  if (phase === 'paused') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('pause.dialogAria')}
        dir={dir}
        className="fixed inset-0 z-30 flex items-center justify-center p-6 bg-[#03070b]/82"
      >
        <div className="w-full max-w-sm bg-[#070f17] border border-slate-600/60 p-7 font-mono text-start">
          <div className="text-xs tracking-[0.24em] text-sky-300/80 uppercase mb-1">
            <bdi dir="ltr">{t('pause.project')}</bdi>
          </div>
          <h2
            data-ar-text={isRtl ? 'true' : undefined}
            className={`text-2xl font-semibold text-slate-100 mb-5 ${
              isRtl ? 'tracking-normal' : 'tracking-[0.18em] uppercase'
            }`}
          >
            {t('pause.title')}
          </h2>

          {/* Language Selection inside Pause Menu */}
          <div className="flex items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-800">
            <span
              data-ar-text={isRtl ? 'true' : undefined}
              className={`text-xs text-slate-400 ${
                isRtl ? 'tracking-normal' : 'tracking-[0.18em] uppercase'
              }`}
            >
              {t('lang.label')}
            </span>
            <LanguageSwitcher />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              data-ar-text={isRtl ? 'true' : undefined}
              onClick={onResume}
              className={`w-full py-3 bg-sky-500/15 hover:bg-sky-400/25 border border-sky-300/60 text-xs text-slate-100 cursor-pointer ${
                isRtl ? 'tracking-normal font-medium' : 'tracking-[0.22em] uppercase'
              }`}
            >
              {t('pause.resume')}
            </button>
            <button
              type="button"
              data-ar-text={isRtl ? 'true' : undefined}
              onClick={onRestart}
              className={`w-full py-3 bg-slate-800/60 hover:bg-slate-700/70 border border-slate-600/70 text-xs text-slate-200 cursor-pointer ${
                isRtl ? 'tracking-normal' : 'tracking-[0.22em] uppercase'
              }`}
            >
              {t('pause.restart')}
            </button>
            <button
              type="button"
              data-ar-text={isRtl ? 'true' : undefined}
              onClick={onReturnToTitle}
              className={`w-full py-3 bg-transparent hover:bg-slate-800/40 border border-slate-700 text-xs text-slate-400 cursor-pointer ${
                isRtl ? 'tracking-normal' : 'tracking-[0.22em] uppercase'
              }`}
            >
              {t('pause.returnTitle')}
            </button>
          </div>

          <div
            data-ar-text={isRtl ? 'true' : undefined}
            className={`mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed flex flex-wrap items-center gap-x-2.5 gap-y-1 ${
              isRtl ? 'tracking-normal' : 'tracking-[0.14em] uppercase'
            }`}
          >
            <span>
              <bdi dir="ltr" className="text-slate-300">
                WASD
              </bdi>{' '}
              {t('controls.move')}
            </span>
            <span>&middot;</span>
            <span>
              <bdi dir="ltr" className="text-slate-300">
                E
              </bdi>{' '}
              {t('controls.interact')}
            </span>
            <span>&middot;</span>
            <span>
              <bdi dir="ltr" className="text-slate-300">
                F
              </bdi>{' '}
              {t('controls.flashlight')}
            </span>
            <span>&middot;</span>
            <span>
              <bdi dir="ltr" className="text-slate-300">
                J
              </bdi>{' '}
              {t('controls.journal')}
            </span>
            <span>&middot;</span>
            <span>
              <bdi dir="ltr" className="text-slate-300">
                M
              </bdi>{' '}
              {t('controls.mute')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
