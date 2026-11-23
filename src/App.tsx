import { useCallback, useEffect, useRef, useState } from 'react';
import { GameCanvas, GameControllerHandle } from './components/GameCanvas';
import { GameHud } from './components/GameHud';
import { Modals } from './components/Modals';
import { TitleScreen } from './components/TitleScreen';
import { ActiveModal, GamePhase, HudState } from './game/types';
import { useLanguage } from './i18n';

const INITIAL_HUD: HudState = {
  phase: 'title',
  modal: 'none',
  zone: 'zone.awakening',
  flashlightOn: true,
  muted: false,
  pointerLocked: false,
  focusedInteractable: null,
  terminalActivated: false,
  recordInspected: false,
  hasAccessCard: false,
  doorUnlocked: false,
  analysisConsoleInspected: false,
  memoryFragmentCompleted: false,
  postMemoryReviewed: false,
  sightingStage: 'idle',
  statusNoteKey: null,
  activeObjectiveId: 'obj_corridor',
  completedObjectiveIds: [],
  discoveredEvidenceIds: [],
  notification: null,
  memory: {
    active: false,
    fragmentId: null,
    mode: 'immersion',
    stage: 'inactive',
    zone: 'memory.zone.entrance',
    anomaliesFound: 0,
    anomaliesTotal: 3,
    discrepancyReady: false,
    echoCycleCount: 0,
    subtitleKey: null,
    focusedPromptKey: null,
    transitionPhase: 'none',
    transitionLabelKey: null,
  },
};

export default function App() {
  const { locale, dir, toggleLocale } = useLanguage();
  const [phase, setPhase] = useState<GamePhase>('title');
  const [modal, setModal] = useState<ActiveModal>('none');
  const [muted, setMuted] = useState(false);
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const controllerRef = useRef<GameControllerHandle | null>(null);

  useEffect(() => {
    document.body.dataset.state = phase;
  }, [phase]);

  // Support ?autostart=1 for automated testing and direct entry
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const id = window.setTimeout(() => {
        controllerRef.current?.startSession();
      }, 60);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, []);

  const handleStart = useCallback(() => {
    controllerRef.current?.startSession();
  }, []);

  const handleResume = useCallback(() => {
    controllerRef.current?.resumeSession();
  }, []);

  const handleRestart = useCallback(() => {
    controllerRef.current?.restartSession();
  }, []);

  const handleReturnToTitle = useCallback(() => {
    controllerRef.current?.returnToTitle();
  }, []);

  const handleCloseModal = useCallback(() => {
    controllerRef.current?.closeModal();
  }, []);

  const handleToggleMute = useCallback(() => {
    controllerRef.current?.toggleMute();
  }, []);

  const handlePause = useCallback(() => {
    controllerRef.current?.pauseGame();
  }, []);

  const handleOpenJournal = useCallback(() => {
    controllerRef.current?.openJournal();
  }, []);

  const handleInitializeReconstruction = useCallback(() => {
    controllerRef.current?.beginMemoryReconstruction();
  }, []);

  return (
    <main
      dir={dir}
      lang={locale}
      className="relative w-screen h-screen overflow-hidden bg-[#04080d]"
    >
      <GameCanvas
        locale={locale}
        phase={phase}
        modal={modal}
        muted={muted}
        onHudChange={setHud}
        onPhaseChange={setPhase}
        onModalChange={setModal}
        onMutedChange={setMuted}
        onToggleLocale={toggleLocale}
        controllerRef={controllerRef}
      />

      {phase === 'title' && <TitleScreen onStart={handleStart} />}

      <GameHud
        hud={hud}
        onToggleMute={handleToggleMute}
        onPause={handlePause}
        onOpenJournal={handleOpenJournal}
      />

      <Modals
        phase={phase}
        modal={modal}
        discoveredEvidenceIds={hud.discoveredEvidenceIds}
        memoryFragmentCompleted={hud.memoryFragmentCompleted}
        onCloseModal={handleCloseModal}
        onInitializeReconstruction={handleInitializeReconstruction}
        onResume={handleResume}
        onRestart={handleRestart}
        onReturnToTitle={handleReturnToTitle}
      />
    </main>
  );
}
