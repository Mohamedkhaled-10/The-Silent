import React from 'react';
import { EVIDENCE_DEFS } from '../game/evidence';
import { OBJECTIVE_DEFS } from '../game/objectives';
import { HudState } from '../game/types';
import { useLanguage } from '../i18n';
import { BidiText } from './BidiText';
import { LanguageSwitcher } from './LanguageSwitcher';

interface GameHudProps {
  hud: HudState;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenJournal: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  hud,
  onToggleMute,
  onPause,
  onOpenJournal,
}) => {
  const { t, isRtl, dir } = useLanguage();

  if (hud.phase !== 'playing') return null;

  const inMemory = hud.memory.active;

  const activeObjective = hud.activeObjectiveId
    ? OBJECTIVE_DEFS.find((item) => item.id === hud.activeObjectiveId) ?? null
    : null;

  const memoryObjectiveTitleKey =
    hud.memory.discrepancyReady || hud.memory.stage === 'collapse'
      ? 'memory.objDiscrepancyTitle'
      : hud.memory.mode === 'observer' ||
          hud.memory.stage === 'observer_transition'
        ? 'memory.objObserveTitle'
        : 'memory.objExploreTitle';

  const memoryObjectiveDescKey =
    hud.memory.discrepancyReady || hud.memory.stage === 'collapse'
      ? 'memory.objDiscrepancyDesc'
      : hud.memory.mode === 'observer' ||
          hud.memory.stage === 'observer_transition'
        ? 'memory.objObserveDesc'
        : 'memory.objExploreDesc';

  const activePromptKey = inMemory
    ? hud.memory.focusedPromptKey
    : hud.focusedInteractable?.promptKey ?? null;

  const notifToneClasses =
    hud.notification?.tone === 'danger'
      ? 'bg-[#1a0a0d]/92 border-red-400/70 text-red-200'
      : hud.notification?.tone === 'success'
        ? 'bg-[#071614]/92 border-emerald-400/65 text-emerald-200'
        : hud.notification?.tone === 'warning'
          ? 'bg-[#171207]/92 border-amber-400/65 text-amber-200'
          : 'bg-[#060f19]/92 border-sky-400/65 text-sky-200';

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-5 md:p-7"
    >
      {/* Fullscreen Scene Transition Curtain (fade out -> swap -> fade in) */}
      {hud.memory.transitionPhase !== 'none' && (
        <div
          data-testid="scene-transition-overlay"
          data-transition-phase={hud.memory.transitionPhase}
          className={`fixed inset-0 z-40 bg-[#030508] pointer-events-none flex items-center justify-center p-8 transition-opacity duration-500 ${
            hud.memory.transitionPhase === 'fading_out'
              ? 'opacity-100'
              : 'opacity-0'
          }`}
        >
          {hud.memory.transitionLabelKey && (
            <div
              data-ar-text={isRtl ? 'true' : undefined}
              className={`font-mono text-xs md:text-sm text-sky-200/90 text-center border-y border-sky-400/35 py-3 px-6 bg-[#070d14]/90 ${
                isRtl ? 'tracking-normal' : 'tracking-[0.22em] uppercase'
              }`}
            >
              <BidiText text={t(hud.memory.transitionLabelKey)} />
            </div>
          )}
        </div>
      )}

      {/* Top Perimeter Cluster */}
      <div className="flex items-start justify-between gap-4">
        {/* Top-Start: Facility or Reconstructed Memory Panel */}
        <div
          data-ar-text={isRtl ? 'true' : undefined}
          className={`max-w-sm md:max-w-[430px] ps-3.5 pe-4 py-2.5 text-start border-s-2 ${
            inMemory
              ? hud.memory.mode === 'observer'
                ? 'bg-[#08121c]/88 border-sky-300/80'
                : 'bg-[#150f0c]/86 border-amber-400/75'
              : 'bg-[#060c14]/82 border-sky-400/75'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[11px] font-mono uppercase ${
                inMemory ? 'text-amber-300/90' : 'text-sky-300/85'
              } ${isRtl ? 'tracking-normal' : 'tracking-[0.2em]'}`}
            >
              {inMemory ? (
                <bdi dir="ltr">{t('memory.fragmentCode')}</bdi>
              ) : (
                <bdi dir="ltr">{t('hud.subjectHeader')}</bdi>
              )}
            </span>

            {inMemory ? (
              <span
                data-testid="hud-memory-mode"
                className={`px-1.5 py-0.5 text-[10px] font-mono border ${
                  hud.memory.mode === 'observer'
                    ? 'bg-sky-500/20 border-sky-300/70 text-sky-200'
                    : 'bg-amber-500/15 border-amber-400/50 text-amber-200'
                } ${isRtl ? 'tracking-normal' : 'tracking-[0.14em] uppercase'}`}
              >
                {hud.memory.mode === 'observer'
                  ? t('memory.modeObserver')
                  : t('memory.modeImmersion')}
              </span>
            ) : (
              hud.hasAccessCard &&
              !hud.doorUnlocked && (
                <span
                  data-testid="hud-card-badge"
                  className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-400/50 text-[10px] font-mono text-emerald-300 tracking-[0.12em]"
                >
                  <bdi dir="ltr">SEC-B04</bdi>
                </span>
              )
            )}
          </div>

          <div
            data-testid="hud-zone"
            className={`text-sm md:text-base font-mono font-medium text-slate-100 mt-0.5 ${
              isRtl ? 'tracking-normal' : 'tracking-[0.16em] uppercase'
            }`}
          >
            {inMemory ? t(hud.memory.zone) : t(hud.zone)}
          </div>

          {inMemory && (
            <div
              className={`text-[11px] font-mono text-amber-200/80 mt-0.5 ${
                isRtl ? 'tracking-normal' : 'tracking-[0.12em] uppercase'
              }`}
            >
              <BidiText text={t('memory.fragmentName')} /> &middot;{' '}
              <BidiText text={t('memory.ownerUnknown')} />
            </div>
          )}

          <div
            data-testid="hud-objective"
            className="mt-2 pt-2 border-t border-slate-700/75"
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={`text-[10px] font-mono ${
                  inMemory ? 'text-amber-300/90' : 'text-sky-300/90'
                } ${isRtl ? 'tracking-normal' : 'tracking-[0.18em] uppercase'}`}
              >
                {inMemory ? (
                  t('obj.panelLabel')
                ) : activeObjective ? (
                  <>
                    {t('obj.stepFormat')}{' '}
                    <bdi dir="ltr">
                      {activeObjective.stepNumber}/{OBJECTIVE_DEFS.length}
                    </bdi>
                  </>
                ) : (
                  t('obj.panelLabel')
                )}
              </div>

              {inMemory && (
                <div
                  data-testid="hud-memory-anomalies"
                  className="text-[10px] font-mono text-amber-200"
                >
                  {t('memory.anomalyCounter')}{' '}
                  <bdi dir="ltr">
                    {hud.memory.anomaliesFound}/{hud.memory.anomaliesTotal}
                  </bdi>
                </div>
              )}
            </div>

            <div
              className={`text-xs font-mono font-semibold text-slate-100 mt-0.5 ${
                isRtl ? 'tracking-normal' : 'tracking-[0.06em]'
              }`}
            >
              <BidiText
                text={
                  inMemory
                    ? t(memoryObjectiveTitleKey)
                    : activeObjective
                      ? t(activeObjective.titleKey)
                      : t('obj.allCompleteTitle')
                }
              />
            </div>
            <div
              className={`text-[11px] text-slate-300/85 mt-0.5 ${
                isRtl ? 'leading-[1.65]' : 'leading-snug'
              }`}
            >
              <BidiText
                text={
                  inMemory
                    ? t(memoryObjectiveDescKey)
                    : activeObjective
                      ? t(activeObjective.descKey)
                      : t('obj.allCompleteDesc')
                }
              />
            </div>
          </div>
        </div>

        {/* Top-Center Notifications & Sighting Anomaly Banner */}
        <div className="flex flex-col items-center gap-2 max-w-md">
          {hud.statusNoteKey && (
            <div
              data-ar-text={isRtl ? 'true' : undefined}
              className={`bg-[#12090c]/88 border border-red-500/50 px-4 py-2 text-xs font-mono text-red-300 text-center ${
                isRtl ? 'tracking-normal' : 'tracking-[0.18em] uppercase'
              }`}
            >
              <BidiText text={t(hud.statusNoteKey)} />
            </div>
          )}

          {hud.notification && (
            <div
              key={hud.notification.id}
              data-testid="hud-notification"
              data-tone={hud.notification.tone}
              data-ar-text={isRtl ? 'true' : undefined}
              className={`border px-4 py-2 text-xs font-mono text-center ${notifToneClasses} ${
                isRtl ? 'tracking-normal' : 'tracking-[0.15em] uppercase'
              }`}
            >
              <BidiText text={t(hud.notification.messageKey)} />
            </div>
          )}
        </div>

        {/* Top-End: Journal [J], Compact Language Switcher, Mute [M], and Pause [P] */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            tabIndex={-1}
            data-testid="hud-journal-btn"
            aria-label={t('hud.journalAria')}
            title={t('hud.journalAria')}
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenJournal();
            }}
            data-ar-text={isRtl ? 'true' : undefined}
            className={`h-10 px-3 flex items-center gap-2 bg-[#060c14]/85 hover:bg-[#0d1826] border border-sky-400/55 text-xs font-mono text-slate-100 cursor-pointer transition-colors ${
              isRtl ? 'tracking-normal' : 'tracking-[0.14em] uppercase'
            }`}
          >
            <bdi dir="ltr" className="text-sky-300 font-semibold">
              [J]
            </bdi>
            <span>{t('hud.journalBtn')}</span>
            <bdi
              dir="ltr"
              className="text-[11px] text-sky-300/90 border-s border-slate-700 ps-2"
            >
              {hud.discoveredEvidenceIds.length}/{EVIDENCE_DEFS.length}
            </bdi>
          </button>

          <LanguageSwitcher compact />

          <button
            type="button"
            tabIndex={-1}
            aria-label={hud.muted ? t('hud.unmuteAria') : t('hud.muteAria')}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="w-10 h-10 flex items-center justify-center bg-[#060c14]/85 hover:bg-[#0d1826] border border-slate-600/60 text-slate-200 cursor-pointer transition-colors"
            title={hud.muted ? t('hud.unmuteAria') : t('hud.muteAria')}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              {hud.muted ? (
                <>
                  <line x1="22" y1="9" x2="16" y2="15" />
                  <line x1="16" y1="9" x2="22" y2="15" />
                </>
              ) : (
                <>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              )}
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label={t('hud.pauseAria')}
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            className="w-10 h-10 flex items-center justify-center bg-[#060c14]/85 hover:bg-[#0d1826] border border-slate-600/60 text-slate-200 cursor-pointer transition-colors"
            title={t('hud.pauseAria')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Exact Center Reticle + Contextual Interaction Prompt */}
      {hud.modal === 'none' && hud.memory.transitionPhase === 'none' && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              activePromptKey
                ? inMemory
                  ? 'bg-amber-300 ring-4 ring-amber-400/30'
                  : 'bg-sky-300 ring-4 ring-sky-400/30'
                : 'bg-slate-200/80 ring-1 ring-black/60'
            }`}
          />
          {activePromptKey && (
            <div
              data-testid="interact-prompt"
              data-ar-text={isRtl ? 'true' : undefined}
              className={`mt-4 px-3.5 py-1.5 bg-[#060c14]/90 border ${
                inMemory ? 'border-amber-300/65' : 'border-sky-300/60'
              } text-xs font-mono text-slate-100 whitespace-nowrap flex items-center gap-2 ${
                isRtl ? 'tracking-normal' : 'tracking-[0.18em] uppercase'
              }`}
            >
              <bdi
                dir="ltr"
                className={
                  inMemory
                    ? 'text-amber-300 font-semibold'
                    : 'text-sky-300 font-semibold'
                }
              >
                [E]
              </bdi>
              <span>
                <BidiText text={t(activePromptKey)} />
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Perimeter Cluster + Memory Subtitle Bar */}
      <div className="flex flex-col gap-3">
        {inMemory && hud.memory.subtitleKey && (
          <div className="flex justify-center">
            <div
              data-testid="memory-subtitle"
              data-ar-text={isRtl ? 'true' : undefined}
              className={`max-w-2xl px-5 py-2.5 text-center font-mono text-xs md:text-sm border ${
                hud.memory.stage === 'collapse'
                  ? 'bg-[#050910]/94 border-sky-400/75 text-sky-100'
                  : 'bg-[#110d0b]/92 border-amber-300/50 text-amber-50'
              } ${isRtl ? 'leading-[1.8] tracking-normal' : 'leading-relaxed tracking-[0.04em]'}`}
            >
              <BidiText text={t(hud.memory.subtitleKey)} />
            </div>
          </div>
        )}

        <div className="flex items-end justify-between gap-4">
        <div
          data-testid="hud-flashlight"
          data-ar-text={isRtl ? 'true' : undefined}
          className={`bg-[#060c14]/80 border-s-2 border-slate-500/70 ps-3.5 pe-4 py-2 flex items-center gap-2.5 text-xs font-mono ${
            isRtl ? 'tracking-normal' : 'tracking-[0.16em] uppercase'
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={hud.flashlightOn ? '#7dd3fc' : '#64748b'}
            strokeWidth="1.75"
            aria-hidden="true"
          >
            <path d="M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12z" />
            <line x1="6" y1="6" x2="18" y2="6" />
          </svg>
          <bdi dir="ltr" className="text-slate-400">
            [F]
          </bdi>
          <span className="text-slate-300">{t('hud.flashlightLabel')}</span>
          <span className={hud.flashlightOn ? 'text-sky-300' : 'text-slate-500'}>
            {hud.flashlightOn ? t('hud.flashlightOn') : t('hud.flashlightOff')}
          </span>
        </div>

        {hud.modal === 'none' && !hud.pointerLocked && (
          <div
            data-ar-text={isRtl ? 'true' : undefined}
            className={`text-[11px] font-mono text-slate-400/90 bg-[#060c14]/75 px-3 py-1.5 ${
              isRtl ? 'tracking-normal' : 'tracking-[0.16em] uppercase'
            }`}
          >
            <BidiText text={t('hud.pointerHint')} />
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
