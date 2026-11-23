import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FacilityAudio } from '../game/audio';
import { resolveMovement } from '../game/collision';
import {
  EvidenceState,
  collectEvidence,
  createInitialEvidenceState,
} from '../game/evidence';
import {
  INTERACTABLES,
  PLAYER_EYE_HEIGHT,
  PLAYER_RADIUS,
  PLAYER_SPAWN,
  PLAYER_WALK_SPEED,
  findFocusedInteractable,
  getActiveColliders,
  getZoneAt,
} from '../game/facilityData';
import {
  StoryProgressState,
  createInitialStoryProgress,
  markAccessCardCollected,
  markAnalysisConsoleInspected,
  markMemoryFragmentCompleted,
  markNeuralScanInspected,
  markPostMemoryReviewed,
  markRecordInspected,
  markSessionReportInspected,
  markTerminalActivated,
  markZoneVisited,
  stepSecurityDoor,
  stepSighting,
  toObjectiveFacts,
  triggerSightingIfReady,
  tryUnlockSecurityDoor,
} from '../game/gameState';
import {
  MEMORY_FRAGMENT_01_DEF,
  REQUIRED_FRAGMENT_01_ANOMALIES,
  findFocusedMemoryInteractable,
  getMemoryZoneAt,
} from '../game/memory/memoryData';
import {
  MemorySoundEffect,
  getMemoryInteractPromptKey,
  interactInMemory,
} from '../game/memory/memoryEvents';
import {
  MemorySceneHandles,
  buildMemoryScene,
} from '../game/memory/memorySceneBuilder';
import {
  createMemorySession,
  stepMemorySimulation,
  updatePhotoAwayState,
} from '../game/memory/memoryState';
import {
  MemoryFacilitySnapshot,
  MemoryHudSummary,
  MemorySessionState,
  MemoryTransitionPhase,
} from '../game/memory/memoryTypes';
import {
  ObjectiveProgressState,
  createInitialObjectiveState,
  getCurrentObjectiveDef,
  reconcileObjectives,
} from '../game/objectives';
import { FacilitySceneHandles, buildFacilityScene } from '../game/sceneBuilder';
import {
  ActiveModal,
  GamePhase,
  HudNotification,
  HudState,
  InteractableDef,
  NotificationTone,
} from '../game/types';
import { Locale, TranslationKey } from '../i18n';

export interface GameControllerHandle {
  startSession: () => void;
  resumeSession: () => void;
  restartSession: () => void;
  returnToTitle: () => void;
  closeModal: () => void;
  openJournal: () => void;
  beginMemoryReconstruction: () => void;
  toggleMute: () => void;
  pauseGame: () => void;
}

interface GameCanvasProps {
  locale: Locale;
  phase: GamePhase;
  modal: ActiveModal;
  muted: boolean;
  onHudChange: (hud: HudState) => void;
  onPhaseChange: (phase: GamePhase) => void;
  onModalChange: (modal: ActiveModal) => void;
  onMutedChange: (muted: boolean) => void;
  onToggleLocale: () => void;
  controllerRef: React.MutableRefObject<GameControllerHandle | null>;
}

interface PendingNotification {
  messageKey: TranslationKey;
  tone: NotificationTone;
  duration: number;
}

// Pre-allocated scratch math helpers (zero GC inside animation loop)
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');

export const GameCanvas: React.FC<GameCanvasProps> = ({
  locale,
  phase,
  modal,
  muted,
  onHudChange,
  onPhaseChange,
  onModalChange,
  onMutedChange,
  onToggleLocale,
  controllerRef,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const facilityRef = useRef<FacilitySceneHandles | null>(null);
  const memoryHandlesRef = useRef<MemorySceneHandles | null>(null);
  const doorUnlockedRef = useRef<boolean>(false);
  const photoChangedRef = useRef<boolean>(false);

  // Latest React state mirrored into refs so the WebGL effect mounts once (`[]`)
  const localeRef = useRef<Locale>(locale);
  const phaseRef = useRef<GamePhase>(phase);
  const modalRef = useRef<ActiveModal>(modal);
  const mutedRef = useRef<boolean>(muted);
  const callbacksRef = useRef({
    onHudChange,
    onPhaseChange,
    onModalChange,
    onMutedChange,
    onToggleLocale,
  });

  localeRef.current = locale;
  phaseRef.current = phase;
  modalRef.current = modal;
  mutedRef.current = muted;
  callbacksRef.current = {
    onHudChange,
    onPhaseChange,
    onModalChange,
    onMutedChange,
    onToggleLocale,
  };

  // Swap only the 3D localized canvas textures when locale changes — never reset scene or player
  useEffect(() => {
    let cancelled = false;
    const applyTextures = () => {
      if (cancelled) return;
      facilityRef.current?.updateLocaleTextures(locale, doorUnlockedRef.current);
      memoryHandlesRef.current?.updateLocaleTextures(
        locale,
        photoChangedRef.current
      );
    };
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(applyTextures);
    } else {
      applyTextures();
    }
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL (SwiftShader / llvmpipe / WARP) via GPU renderer string
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    // Cap DPR at 1.25 for Intel HD Graphics 530 target (1.0 on software WebGL)
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.25)
    );
    renderer.setSize(
      container.clientWidth || window.innerWidth,
      container.clientHeight || window.innerHeight
    );
    renderer.shadowMap.enabled = false; // Explicitly avoid expensive real-time shadow passes

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      68,
      (container.clientWidth || window.innerWidth) /
        (container.clientHeight || window.innerHeight),
      0.08,
      65
    );

    // Procedural studio environment reflection so metallic bulkheads/racks read cleanly
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.36;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const facility = buildFacilityScene(scene, maxAnisotropy, localeRef.current);
    facilityRef.current = facility;
    const audio = new FacilityAudio();

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (!disposed) {
          facilityRef.current?.updateLocaleTextures(
            localeRef.current,
            doorUnlockedRef.current
          );
        }
      });
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Simulation state (mutated in-place inside loop)
    let playerX = PLAYER_SPAWN.x;
    let playerZ = PLAYER_SPAWN.z;
    let yaw = PLAYER_SPAWN.yaw;
    let pitch = PLAYER_SPAWN.pitch;
    let flashlightOn = true;
    let pointerLocked = false;
    let isDraggingLook = false;
    let lastDragX = 0;
    let lastDragY = 0;
    let strideDistance = 0;
    let nextStepDist = 1.55;
    let statusNoteKey: TranslationKey | null = null;
    let statusNoteTimer = 0;
    let titleTourTime = 0;
    let storyProgress: StoryProgressState = createInitialStoryProgress();
    let evidenceState: EvidenceState = createInitialEvidenceState();
    let objectiveState: ObjectiveProgressState = createInitialObjectiveState();

    // Active reconstructed memory runtime + smooth transition state
    let memorySession: MemorySessionState | null = null;
    let memoryHandles: MemorySceneHandles | null = null;
    let pendingSnapshot: MemoryFacilitySnapshot | null = null;
    let transitionPhase: MemoryTransitionPhase = 'none';
    let transitionTarget: 'none' | 'enter_memory' | 'exit_memory' = 'none';
    let transitionTimer = 0;
    let transitionLabelKey: TranslationKey | null = null;
    let memorySubtitleKey: TranslationKey | null = null;
    let memorySubtitleTimer = 0;
    let memoryElapsed = 0;

    const FADE_OUT_DURATION = 0.52;
    const FADE_IN_DURATION = 0.48;

    const disposeActiveMemory = () => {
      if (memoryHandles) {
        memoryHandles.dispose();
        memoryHandles = null;
      }
      memoryHandlesRef.current = null;
      memorySession = null;
      photoChangedRef.current = false;
      memorySubtitleKey = null;
      memorySubtitleTimer = 0;
      memoryElapsed = 0;
      audio.setEnvironmentMode('facility');
    };

    const playMemoryCue = (sound: MemorySoundEffect) => {
      switch (sound) {
        case 'clock_tick':
          audio.playClockTickSequence();
          break;
        case 'photo_shift':
          audio.playPhotoShiftCue();
          break;
        case 'phone_ring_static':
          audio.playPhoneRingStatic();
          break;
        case 'recorder_hum':
          audio.playTerminalBeep();
          break;
        case 'door_locked':
          audio.playAccessDenied();
          break;
        case 'observer_shift':
          audio.playObserverShift();
          break;
        case 'collapse':
          audio.playMemoryCollapse();
          break;
        case 'none':
          break;
      }
    };

    // Timed HUD notifications
    let notification: HudNotification | null = null;
    let notificationTimer = 0;
    let nextNotificationId = 1;
    const notificationQueue: PendingNotification[] = [];

    const enqueueNotification = (
      messageKey: TranslationKey,
      tone: NotificationTone,
      duration = 2.4
    ) => {
      if (!notification) {
        notification = { id: nextNotificationId++, messageKey, tone };
        notificationTimer = duration;
        return;
      }
      if (notification.messageKey === messageKey) return;
      if (
        notificationQueue.length < 2 &&
        !notificationQueue.some((item) => item.messageKey === messageKey)
      ) {
        notificationQueue.push({ messageKey, tone, duration });
      }
    };

    const replaceNotification = (
      messageKey: TranslationKey,
      tone: NotificationTone,
      duration = 2.8
    ) => {
      notificationQueue.length = 0;
      notification = { id: nextNotificationId++, messageKey, tone };
      notificationTimer = duration;
    };

    // Input tracking: held vs edge-triggered
    const keysHeld = new Set<string>();
    const justPressed = new Set<string>();
    let suppressUnlockPause = false;

    let lastPublishedHudKey = '';
    const publishHud = (
      focused: InteractableDef | null,
      memoryFocusedPromptKey: TranslationKey | null = null
    ) => {
      const zone = getZoneAt(playerX, playerZ);
      const activeObj = getCurrentObjectiveDef(objectiveState);
      const memorySummary: MemoryHudSummary = memorySession
        ? {
            active: true,
            fragmentId: memorySession.fragmentId,
            mode: memorySession.mode,
            stage: memorySession.stage,
            zone: getMemoryZoneAt(playerX, playerZ),
            anomaliesFound: memorySession.discoveredAnomalies.length,
            anomaliesTotal: REQUIRED_FRAGMENT_01_ANOMALIES.length,
            discrepancyReady: memorySession.discrepancyInteractableReady,
            echoCycleCount: memorySession.echoCycleCount,
            subtitleKey: memorySubtitleKey,
            focusedPromptKey: memoryFocusedPromptKey,
            transitionPhase,
            transitionLabelKey,
          }
        : {
            active: false,
            fragmentId: null,
            mode: 'immersion',
            stage: 'inactive',
            zone: 'memory.zone.entrance',
            anomaliesFound: 0,
            anomaliesTotal: REQUIRED_FRAGMENT_01_ANOMALIES.length,
            discrepancyReady: false,
            echoCycleCount: 0,
            subtitleKey: null,
            focusedPromptKey: null,
            transitionPhase,
            transitionLabelKey,
          };

      const key = `${phaseRef.current}|${modalRef.current}|${zone}|${flashlightOn}|${mutedRef.current}|${pointerLocked}|${focused?.id ?? 'none'}|${storyProgress.terminalActivated}|${storyProgress.recordInspected}|${storyProgress.hasAccessCard}|${storyProgress.doorUnlocked}|${storyProgress.analysisConsoleInspected}|${storyProgress.memoryFragmentCompleted}|${storyProgress.postMemoryReviewed}|${storyProgress.sightingStage}|${statusNoteKey ?? ''}|${activeObj?.id ?? 'done'}|${objectiveState.completedIds.length}|${evidenceState.discoveredIds.length}|${notification?.id ?? 0}|${memorySummary.active}|${memorySummary.mode}|${memorySummary.stage}|${memorySummary.zone}|${memorySummary.anomaliesFound}|${memorySummary.discrepancyReady}|${memorySummary.echoCycleCount}|${memorySummary.subtitleKey ?? ''}|${memorySummary.focusedPromptKey ?? ''}|${memorySummary.transitionPhase}|${memorySummary.transitionLabelKey ?? ''}`;
      if (key === lastPublishedHudKey) return;
      lastPublishedHudKey = key;
      callbacksRef.current.onHudChange({
        phase: phaseRef.current,
        modal: modalRef.current,
        zone,
        flashlightOn,
        muted: mutedRef.current,
        pointerLocked,
        focusedInteractable: focused,
        terminalActivated: storyProgress.terminalActivated,
        recordInspected: storyProgress.recordInspected,
        hasAccessCard: storyProgress.hasAccessCard,
        doorUnlocked: storyProgress.doorUnlocked,
        analysisConsoleInspected: storyProgress.analysisConsoleInspected,
        memoryFragmentCompleted: storyProgress.memoryFragmentCompleted,
        postMemoryReviewed: storyProgress.postMemoryReviewed,
        sightingStage: storyProgress.sightingStage,
        statusNoteKey,
        activeObjectiveId: activeObj ? activeObj.id : null,
        completedObjectiveIds: objectiveState.completedIds,
        discoveredEvidenceIds: evidenceState.discoveredIds,
        notification,
        memory: memorySummary,
      });
    };

    const requestLock = () => {
      try {
        if (
          document.pointerLockElement !== canvas &&
          typeof canvas.requestPointerLock === 'function'
        ) {
          const maybePromise = canvas.requestPointerLock() as unknown as
            | Promise<void>
            | undefined;
          if (maybePromise && typeof maybePromise.catch === 'function') {
            maybePromise.catch(() => {
              // Headless or browser-blocked pointer lock falls back cleanly to drag-look
            });
          }
        }
      } catch {
        // Ignore pointer lock rejection
      }
    };

    const exitLock = () => {
      suppressUnlockPause = true;
      try {
        if (document.pointerLockElement === canvas) {
          document.exitPointerLock?.();
        }
      } catch {
        // Ignore
      }
      window.setTimeout(() => {
        suppressUnlockPause = false;
      }, 60);
    };

    const resetGameplayState = () => {
      disposeActiveMemory();
      pendingSnapshot = null;
      transitionPhase = 'none';
      transitionTarget = 'none';
      transitionTimer = 0;
      transitionLabelKey = null;
      playerX = PLAYER_SPAWN.x;
      playerZ = PLAYER_SPAWN.z;
      yaw = PLAYER_SPAWN.yaw;
      pitch = PLAYER_SPAWN.pitch;
      flashlightOn = true;
      strideDistance = 0;
      nextStepDist = 1.55;
      statusNoteKey = null;
      statusNoteTimer = 0;
      notification = null;
      notificationTimer = 0;
      notificationQueue.length = 0;
      storyProgress = createInitialStoryProgress();
      evidenceState = createInitialEvidenceState();
      objectiveState = createInitialObjectiveState();
      doorUnlockedRef.current = false;
      facility.setAccessCardVisible(true);
      facility.updateSecurityDoor(false, 0);
      facility.silhouette.visible = false;
      facility.silhouetteMaterial.opacity = 0;
      for (const item of facility.obsLights) {
        item.light.intensity = item.baseIntensity;
      }
      facility.testBayBacklight.light.intensity =
        facility.testBayBacklight.baseIntensity;
      keysHeld.clear();
      justPressed.clear();
    };

    // Expose imperative controller actions to React UI
    controllerRef.current = {
      startSession: () => {
        audio.unlockAndStart();
        audio.setPaused(false);
        resetGameplayState();
        document.body.dataset.state = 'playing';
        callbacksRef.current.onModalChange('none');
        callbacksRef.current.onPhaseChange('playing');
        requestLock();
        publishHud(null);
      },
      resumeSession: () => {
        audio.unlockAndStart();
        audio.setPaused(false);
        keysHeld.clear();
        justPressed.clear();
        document.body.dataset.state = 'playing';
        callbacksRef.current.onPhaseChange('playing');
        requestLock();
        publishHud(null);
      },
      restartSession: () => {
        audio.unlockAndStart();
        audio.setPaused(false);
        resetGameplayState();
        document.body.dataset.state = 'playing';
        callbacksRef.current.onModalChange('none');
        callbacksRef.current.onPhaseChange('playing');
        requestLock();
        publishHud(null);
      },
      returnToTitle: () => {
        exitLock();
        audio.setPaused(true);
        resetGameplayState();
        document.body.dataset.state = 'title';
        callbacksRef.current.onModalChange('none');
        callbacksRef.current.onPhaseChange('title');
        publishHud(null);
      },
      closeModal: () => {
        const prevModal = modalRef.current;
        if (prevModal === 'none') return;
        callbacksRef.current.onModalChange('none');
        if (prevModal === 'terminal') {
          storyProgress = triggerSightingIfReady(storyProgress);
        }
        keysHeld.clear();
        justPressed.clear();
        if (phaseRef.current === 'playing') {
          requestLock();
        }
        publishHud(null);
      },
      openJournal: () => {
        if (phaseRef.current !== 'playing') return;
        if (modalRef.current === 'journal') {
          controllerRef.current?.closeModal();
          return;
        }
        if (modalRef.current !== 'none') return;
        if (storyProgress.memoryFragmentCompleted) {
          storyProgress = markPostMemoryReviewed(storyProgress);
        }
        suppressUnlockPause = true;
        exitLock();
        keysHeld.clear();
        justPressed.clear();
        callbacksRef.current.onModalChange('journal');
        publishHud(null);
      },
      beginMemoryReconstruction: () => {
        if (
          phaseRef.current !== 'playing' ||
          transitionPhase !== 'none' ||
          memorySession !== null
        ) {
          return;
        }
        audio.unlockAndStart();
        audio.setPaused(false);
        keysHeld.clear();
        justPressed.clear();
        notification = null;
        notificationTimer = 0;
        notificationQueue.length = 0;
        callbacksRef.current.onModalChange('none');
        pendingSnapshot = {
          playerX,
          playerZ,
          yaw,
          pitch,
          flashlightOn,
        };
        transitionPhase = 'fading_out';
        transitionTarget = 'enter_memory';
        transitionTimer = 0;
        transitionLabelKey = 'memory.transitionIn';
        audio.playMemoryTransition(true);
        requestLock();
        publishHud(null);
      },
      toggleMute: () => {
        const nextMuted = !mutedRef.current;
        audio.setMuted(nextMuted);
        callbacksRef.current.onMutedChange(nextMuted);
      },
      pauseGame: () => {
        if (phaseRef.current !== 'playing') return;
        exitLock();
        audio.setPaused(true);
        keysHeld.clear();
        justPressed.clear();
        callbacksRef.current.onModalChange('none');
        document.body.dataset.state = 'paused';
        callbacksRef.current.onPhaseChange('paused');
        publishHud(null);
      },
    };

    // Event Listeners
    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(
        isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.25)
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.repeat) {
        justPressed.add(e.code);
      }
      keysHeld.add(e.code);

      if (phaseRef.current === 'title') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          controllerRef.current?.startSession();
        }
        return;
      }

      if (e.code === 'KeyM' && !e.repeat) {
        controllerRef.current?.toggleMute();
        return;
      }

      if (e.code === 'KeyL' && !e.repeat) {
        callbacksRef.current.onToggleLocale();
        return;
      }

      if (phaseRef.current === 'paused') {
        if ((e.code === 'Escape' || e.code === 'KeyP') && !e.repeat) {
          e.preventDefault();
          controllerRef.current?.resumeSession();
        }
        return;
      }

      if (phaseRef.current === 'playing') {
        if (e.code === 'KeyJ' && !e.repeat) {
          if (modalRef.current === 'none') {
            e.preventDefault();
            controllerRef.current?.openJournal();
            return;
          }
          if (modalRef.current === 'journal') {
            e.preventDefault();
            controllerRef.current?.closeModal();
            return;
          }
        }

        if (modalRef.current !== 'none') {
          const isCloseKey =
            e.code === 'Escape' ||
            (e.code === 'KeyE' && modalRef.current !== 'journal');
          if (isCloseKey && !e.repeat) {
            e.preventDefault();
            controllerRef.current?.closeModal();
          }
          return;
        }

        if ((e.code === 'Escape' || e.code === 'KeyP') && !e.repeat) {
          e.preventDefault();
          controllerRef.current?.pauseGame();
          return;
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeld.delete(e.code);
    };

    const clearInputs = () => {
      keysHeld.clear();
      justPressed.clear();
      isDraggingLook = false;
    };

    const onVisibilityChange = () => {
      if (document.hidden) clearInputs();
    };

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      pointerLocked = locked;
      if (
        !locked &&
        !suppressUnlockPause &&
        phaseRef.current === 'playing' &&
        modalRef.current === 'none'
      ) {
        // ESC pressed by user while Pointer Locked releases mouse and pauses cleanly
        audio.setPaused(true);
        keysHeld.clear();
        document.body.dataset.state = 'paused';
        callbacksRef.current.onPhaseChange('paused');
      }
      publishHud(null);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.target !== canvas) return;
      if (phaseRef.current !== 'playing' || modalRef.current !== 'none') return;
      audio.unlockAndStart();
      if (!pointerLocked) {
        isDraggingLook = true;
        lastDragX = e.clientX;
        lastDragY = e.clientY;
        requestLock();
      }
    };

    const onMouseUp = () => {
      isDraggingLook = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (phaseRef.current !== 'playing' || modalRef.current !== 'none') return;
      if (!pointerLocked && !isDraggingLook) return;
      const dx = pointerLocked
        ? e.movementX
        : e.movementX !== 0
          ? e.movementX
          : e.clientX - lastDragX;
      const dy = pointerLocked
        ? e.movementY
        : e.movementY !== 0
          ? e.movementY
          : e.clientY - lastDragY;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      const sensitivity = 0.0022;
      yaw -= dx * sensitivity;
      pitch = THREE.MathUtils.clamp(
        pitch - dy * sensitivity,
        -Math.PI / 2.25,
        Math.PI / 2.25
      );
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearInputs);
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    // Main loop (paced via afterDraw on software WebGL, rAF on hardware GPU)
    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync
        ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
        : null;
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick(nowArg?: number) {
      if (disposed) return;
      const now = typeof nowArg === 'number' ? nowArg : performance.now();
      const rawDt = Math.max(0, (now - lastTime) / 1000);
      lastTime = now;
      // On real GPUs clamp at 0.05s; on slow software WebGL allow larger step with sub-stepping so walk speed stays real-time
      const dt = isSoftwareGl
        ? Math.min(rawDt, 0.45)
        : Math.min(rawDt, 0.05);

      const currentPhase = phaseRef.current;
      const currentModal = modalRef.current;

      // Advance active scene fade transition cleanly
      if (currentPhase === 'playing' && transitionPhase !== 'none') {
        transitionTimer += dt;
        if (
          transitionPhase === 'fading_out' &&
          transitionTimer >= FADE_OUT_DURATION
        ) {
          if (transitionTarget === 'enter_memory' && pendingSnapshot) {
            disposeActiveMemory();
            memoryHandles = buildMemoryScene(
              'memory_fragment_01',
              maxAnisotropy,
              localeRef.current
            );
            memoryHandles.scene.environment = envTarget.texture;
            memoryHandles.scene.environmentIntensity = 0.25;
            if (!isSoftwareGl) {
              renderer.compile(memoryHandles.scene, camera);
            }
            memoryHandlesRef.current = memoryHandles;
            memorySession = createMemorySession(
              'memory_fragment_01',
              pendingSnapshot
            );
            pendingSnapshot = null;
            playerX = MEMORY_FRAGMENT_01_DEF.spawn.x;
            playerZ = MEMORY_FRAGMENT_01_DEF.spawn.z;
            yaw = MEMORY_FRAGMENT_01_DEF.spawn.yaw;
            pitch = MEMORY_FRAGMENT_01_DEF.spawn.pitch;
            strideDistance = 0;
            nextStepDist = 1.55;
            audio.setEnvironmentMode('memory');
          } else if (transitionTarget === 'exit_memory') {
            const snap = memorySession?.facilitySnapshot ?? pendingSnapshot;
            disposeActiveMemory();
            pendingSnapshot = null;
            if (snap) {
              playerX = snap.playerX;
              playerZ = snap.playerZ;
              yaw = snap.yaw;
              pitch = snap.pitch;
              flashlightOn = snap.flashlightOn;
            }
            strideDistance = 0;
            nextStepDist = 1.55;
            storyProgress = markMemoryFragmentCompleted(storyProgress);
            const ev = collectEvidence(evidenceState, 'memory_fragment_01');
            evidenceState = ev.next;
            if (ev.added) {
              audio.playEvidenceCollected();
              enqueueNotification('hud.evidenceCollected', 'info', 2.8);
            }
          }
          transitionPhase = 'fading_in';
          transitionTimer = 0;
        } else if (
          transitionPhase === 'fading_in' &&
          transitionTimer >= FADE_IN_DURATION
        ) {
          transitionPhase = 'none';
          transitionTarget = 'none';
          transitionTimer = 0;
          transitionLabelKey = null;
          keysHeld.clear();
          justPressed.clear();
        }
      }

      if (currentPhase === 'title') {
        // Atmospheric live camera pan inside the facility corridor
        titleTourTime += dt;
        const panZ = -6.0 + Math.sin(titleTourTime * 0.18) * 3.8;
        const swayX = Math.sin(titleTourTime * 0.25) * 0.35;
        camera.position.set(swayX, PLAYER_EYE_HEIGHT + 0.05, panZ);
        camera.lookAt(0, 1.45, -21.0);
        facility.flashlight.intensity = 0;
        // Subtle red warning light breathing
        facility.redBeacons[0].intensity =
          1.9 + Math.sin(titleTourTime * 2.2) * 0.6;
      } else if (memorySession !== null && memoryHandles !== null) {
        // Active Reconstructed Memory Loop (Facility scene stays dormant & unrendered)
        let focusedPromptKey: TranslationKey | null = null;

        if (
          currentPhase === 'playing' &&
          currentModal === 'none' &&
          transitionPhase === 'none'
        ) {
          if (justPressed.has('KeyF')) {
            flashlightOn = !flashlightOn;
            audio.playFlashlightClick(flashlightOn);
          }

          const moveForward =
            (keysHeld.has('KeyW') || keysHeld.has('ArrowUp') ? 1 : 0) -
            (keysHeld.has('KeyS') || keysHeld.has('ArrowDown') ? 1 : 0);
          const moveRight =
            (keysHeld.has('KeyD') || keysHeld.has('ArrowRight') ? 1 : 0) -
            (keysHeld.has('KeyA') || keysHeld.has('ArrowLeft') ? 1 : 0);

          let moveDist = 0;
          if (
            memorySession.stage !== 'collapse' &&
            (moveForward !== 0 || moveRight !== 0)
          ) {
            const len = Math.hypot(moveForward, moveRight);
            const nf = moveForward / len;
            const nr = moveRight / len;
            const sinY = Math.sin(yaw);
            const cosY = Math.cos(yaw);
            const stepMax = 0.04;
            let remaining = dt;
            while (remaining > 0) {
              const subDt = Math.min(remaining, stepMax);
              remaining -= subDt;
              const vx = (-sinY * nf + cosY * nr) * PLAYER_WALK_SPEED * subDt;
              const vz = (-cosY * nf - sinY * nr) * PLAYER_WALK_SPEED * subDt;
              const nextPos = resolveMovement(
                { x: playerX, z: playerZ },
                vx,
                vz,
                PLAYER_RADIUS,
                MEMORY_FRAGMENT_01_DEF.colliders
              );
              const d = Math.hypot(nextPos.x - playerX, nextPos.z - playerZ);
              moveDist += d;
              playerX = nextPos.x;
              playerZ = nextPos.z;
            }
            strideDistance += moveDist;
            if (strideDistance >= nextStepDist) {
              nextStepDist += 1.48;
              audio.playFootstep();
            }
          }

          const bobOffset =
            moveDist > 0.0005 ? Math.sin(strideDistance * 4.2) * 0.025 : 0;
          camera.position.set(playerX, PLAYER_EYE_HEIGHT + bobOffset, playerZ);
          _euler.set(pitch, yaw, 0, 'YXZ');
          camera.quaternion.setFromEuler(_euler);

          _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
          _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
          memoryHandles.flashlight.position
            .copy(camera.position)
            .addScaledVector(_right, 0.14)
            .setY(camera.position.y - 0.12);
          memoryHandles.flashlightTarget.position
            .copy(camera.position)
            .addScaledVector(_forward, 10.0);

          // Check whether player inspected and stepped/looked away from photograph
          memorySession = updatePhotoAwayState(
            memorySession,
            playerX,
            playerZ,
            _forward.x,
            _forward.z
          );
          photoChangedRef.current = memorySession.photoChanged;

          // Interactable ray/cone focus check inside apartment
          const focusedMem = findFocusedMemoryInteractable(
            camera.position.x,
            camera.position.y,
            camera.position.z,
            _forward.x,
            _forward.y,
            _forward.z
          );
          focusedPromptKey = focusedMem
            ? getMemoryInteractPromptKey(memorySession, focusedMem.id)
            : null;

          if (justPressed.has('KeyE') && focusedMem) {
            const outcome = interactInMemory(memorySession, focusedMem.id);
            memorySession = outcome.nextState;
            photoChangedRef.current = memorySession.photoChanged;
            memorySubtitleKey = outcome.subtitleKey;
            memorySubtitleTimer = outcome.triggeredCollapse ? 4.2 : 4.8;
            playMemoryCue(outcome.sound);
            if (outcome.recordedNewAnomaly) {
              enqueueNotification('memory.msg.anomalyToast', 'warning', 2.4);
            }
          }

          // Advance Observer transition, Echo cycles, and Collapse countdown
          const stepRes = stepMemorySimulation(memorySession, dt);
          memorySession = stepRes.next;
          if (stepRes.justEnteredObserver) {
            memorySubtitleKey = 'memory.msg.observerShift';
            memorySubtitleTimer = 4.2;
            audio.playObserverShift();
          } else if (stepRes.justChangedEchoDetail) {
            memorySubtitleKey = 'memory.msg.echoCycleShift';
            memorySubtitleTimer = 4.6;
            audio.playPhotoShiftCue();
          }
          if (stepRes.justCompletedCollapse) {
            transitionPhase = 'fading_out';
            transitionTarget = 'exit_memory';
            transitionTimer = 0;
            transitionLabelKey = 'memory.transitionOut';
            audio.playMemoryTransition(false);
          }

          if (memorySubtitleTimer > 0 && memorySession.stage !== 'collapse') {
            memorySubtitleTimer -= dt;
            if (memorySubtitleTimer <= 0) {
              memorySubtitleKey = null;
            }
          }
        } else {
          camera.position.set(playerX, PLAYER_EYE_HEIGHT, playerZ);
          _euler.set(pitch, yaw, 0, 'YXZ');
          camera.quaternion.setFromEuler(_euler);
          _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
          _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
          memoryHandles.flashlight.position
            .copy(camera.position)
            .addScaledVector(_right, 0.14)
            .setY(camera.position.y - 0.12);
          memoryHandles.flashlightTarget.position
            .copy(camera.position)
            .addScaledVector(_forward, 10.0);
        }

        if (currentPhase === 'playing') {
          memoryElapsed += dt;
          memoryHandles.stepVisuals(
            memorySession,
            memoryElapsed,
            dt,
            flashlightOn
          );
        }

        if (
          currentPhase === 'playing' &&
          currentModal === 'none' &&
          notificationTimer > 0
        ) {
          notificationTimer -= dt;
          if (notificationTimer <= 0) {
            const nextQueued = notificationQueue.shift();
            if (nextQueued) {
              notification = {
                id: nextNotificationId++,
                messageKey: nextQueued.messageKey,
                tone: nextQueued.tone,
              };
              notificationTimer = nextQueued.duration;
            } else {
              notification = null;
              notificationTimer = 0;
            }
          }
        }

        publishHud(null, focusedPromptKey);
      } else {
        // Active Underground Facility Loop
        const pulseT = now * 0.001;
        facility.redBeacons[0].intensity =
          1.9 + Math.sin(pulseT * 2.4) * 0.6;
        facility.stepAmbientProps(pulseT);

        // Animate security bulkhead opening smoothly while unpaused
        if (currentPhase === 'playing') {
          storyProgress = stepSecurityDoor(storyProgress, dt);
          facility.updateSecurityDoor(
            storyProgress.doorUnlocked,
            storyProgress.doorOpenProgress
          );
        }

        if (
          currentPhase === 'playing' &&
          currentModal === 'none' &&
          transitionPhase === 'none'
        ) {
          // 1. Edge-triggered actions
          if (justPressed.has('KeyF')) {
            flashlightOn = !flashlightOn;
            audio.playFlashlightClick(flashlightOn);
          }

          // 2. Movement along camera horizontal heading (substepped <= 0.04s to prevent wall tunneling)
          const moveForward =
            (keysHeld.has('KeyW') || keysHeld.has('ArrowUp') ? 1 : 0) -
            (keysHeld.has('KeyS') || keysHeld.has('ArrowDown') ? 1 : 0);
          const moveRight =
            (keysHeld.has('KeyD') || keysHeld.has('ArrowRight') ? 1 : 0) -
            (keysHeld.has('KeyA') || keysHeld.has('ArrowLeft') ? 1 : 0);

          const activeColliders = getActiveColliders(
            storyProgress.doorOpenProgress
          );

          let moveDist = 0;
          if (moveForward !== 0 || moveRight !== 0) {
            const len = Math.hypot(moveForward, moveRight);
            const nf = moveForward / len;
            const nr = moveRight / len;
            const sinY = Math.sin(yaw);
            const cosY = Math.cos(yaw);
            const stepMax = 0.04;
            let remaining = dt;
            while (remaining > 0) {
              const subDt = Math.min(remaining, stepMax);
              remaining -= subDt;
              const vx = (-sinY * nf + cosY * nr) * PLAYER_WALK_SPEED * subDt;
              const vz = (-cosY * nf - sinY * nr) * PLAYER_WALK_SPEED * subDt;
              const nextPos = resolveMovement(
                { x: playerX, z: playerZ },
                vx,
                vz,
                PLAYER_RADIUS,
                activeColliders
              );
              const d = Math.hypot(nextPos.x - playerX, nextPos.z - playerZ);
              moveDist += d;
              playerX = nextPos.x;
              playerZ = nextPos.z;
            }
            strideDistance += moveDist;

            if (strideDistance >= nextStepDist) {
              nextStepDist += 1.48;
              audio.playFootstep();
            }
          }

          // Track room discovery for objective gating
          const currentZone = getZoneAt(playerX, playerZ);
          storyProgress = markZoneVisited(storyProgress, currentZone);

          // 3. Camera transform with distance-synced subtle breathing/head-bob
          const bobOffset =
            moveDist > 0.0005 ? Math.sin(strideDistance * 4.2) * 0.028 : 0;
          camera.position.set(playerX, PLAYER_EYE_HEIGHT + bobOffset, playerZ);
          _euler.set(pitch, yaw, 0, 'YXZ');
          camera.quaternion.setFromEuler(_euler);

          // 4. Flashlight alignment (slight shoulder offset)
          _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
          _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
          facility.flashlight.position
            .copy(camera.position)
            .addScaledVector(_right, 0.14)
            .setY(camera.position.y - 0.12);
          facility.flashlightTarget.position
            .copy(camera.position)
            .addScaledVector(_forward, 10.0);
          facility.flashlight.intensity = flashlightOn ? 15.0 : 0;

          // 5. Interactable focus check
          const focused = findFocusedInteractable(
            camera.position.x,
            camera.position.y,
            camera.position.z,
            _forward.x,
            _forward.y,
            _forward.z,
            INTERACTABLES,
            {
              hasAccessCard: storyProgress.hasAccessCard,
              doorUnlocked: storyProgress.doorUnlocked,
            }
          );

          if (justPressed.has('KeyE') && focused) {
            if (focused.id === 'terminal') {
              storyProgress = markTerminalActivated(storyProgress);
              audio.playTerminalBeep();
              const ev = collectEvidence(evidenceState, 'initial_diagnostic');
              evidenceState = ev.next;
              if (ev.added) {
                audio.playEvidenceCollected();
                enqueueNotification('hud.evidenceCollected', 'info', 2.4);
              }
            } else if (focused.id === 'record') {
              storyProgress = markRecordInspected(storyProgress);
              audio.playPaperRustle();
              const ev = collectEvidence(evidenceState, 'subject_012_record');
              evidenceState = ev.next;
              if (ev.added) {
                audio.playEvidenceCollected();
                enqueueNotification('hud.evidenceCollected', 'info', 2.4);
              }
            } else if (focused.id === 'access_card') {
              storyProgress = markAccessCardCollected(storyProgress);
              facility.setAccessCardVisible(false);
              audio.playAccessCardPickup();
              const ev = collectEvidence(evidenceState, 'memory_access_notice');
              evidenceState = ev.next;
              replaceNotification('hud.cardCollected', 'success', 2.5);
            } else if (focused.id === 'security_door') {
              const unlockRes = tryUnlockSecurityDoor(storyProgress);
              if (!unlockRes.granted) {
                audio.playAccessDenied();
                replaceNotification('hud.accessDenied', 'danger', 2.8);
              } else if (!unlockRes.alreadyUnlocked) {
                storyProgress = unlockRes.next;
                doorUnlockedRef.current = true;
                audio.playAccessGranted();
                facility.updateSecurityDoor(
                  true,
                  storyProgress.doorOpenProgress
                );
                replaceNotification('hud.accessGranted', 'success', 2.8);
              }
            } else if (focused.id === 'neural_scan') {
              storyProgress = markNeuralScanInspected(storyProgress);
              audio.playTerminalBeep();
              const ev = collectEvidence(evidenceState, 'neural_scan_log');
              evidenceState = ev.next;
              if (ev.added) {
                audio.playEvidenceCollected();
                enqueueNotification('hud.evidenceCollected', 'info', 2.4);
              }
            } else if (focused.id === 'session_report') {
              storyProgress = markSessionReportInspected(storyProgress);
              audio.playPaperRustle();
              const ev = collectEvidence(evidenceState, 'session_report_memo');
              evidenceState = ev.next;
              if (ev.added) {
                audio.playEvidenceCollected();
                enqueueNotification('hud.evidenceCollected', 'info', 2.4);
              }
            } else if (focused.id === 'memory_console') {
              storyProgress = markAnalysisConsoleInspected(storyProgress);
              if (storyProgress.memoryFragmentCompleted) {
                storyProgress = markPostMemoryReviewed(storyProgress);
              }
              audio.playTerminalBeep();
              const ev = collectEvidence(
                evidenceState,
                'memory_console_readout'
              );
              evidenceState = ev.next;
              if (ev.added) {
                audio.playEvidenceCollected();
                enqueueNotification('hud.evidenceCollected', 'info', 2.4);
              }
            }

            if (focused.modal !== null) {
              suppressUnlockPause = true;
              exitLock();
              keysHeld.clear();
              callbacksRef.current.onModalChange(focused.modal);
            }
          }

          // 6. Objective progression reconciliation (strictly event-driven, no repeat toasts)
          const objRes = reconcileObjectives(
            objectiveState,
            toObjectiveFacts(storyProgress)
          );
          objectiveState = objRes.next;
          if (objRes.newlyCompleted.length > 0) {
            audio.playObjectiveComplete();
            enqueueNotification('obj.completedToast', 'success', 2.2);
          }

          // 7. Sighting sequence progression (Milestone 01 behavior preserved)
          const sightingRes = stepSighting(storyProgress, dt);
          storyProgress = sightingRes.next;
          const vis = sightingRes.visual;

          facility.silhouette.visible = vis.silhouetteVisible;
          facility.silhouetteMaterial.opacity = vis.silhouetteOpacity;

          for (const item of facility.obsLights) {
            item.light.intensity = item.baseIntensity * vis.lightFactor;
          }
          facility.testBayBacklight.light.intensity =
            facility.testBayBacklight.baseIntensity *
            (vis.silhouetteVisible ? 1.15 : vis.lightFactor);

          if (vis.justStartedAppear) {
            audio.playSightingCue(false);
            statusNoteKey = 'hud.anomalyDetected';
            statusNoteTimer = 3.2;
          } else if (vis.justStartedFlicker) {
            audio.playSightingCue(true);
          }

          if (statusNoteTimer > 0) {
            statusNoteTimer -= dt;
            if (statusNoteTimer <= 0) {
              statusNoteKey = null;
            }
          }

          // Tick active notification only while unpaused and unobstructed by modals
          if (notificationTimer > 0) {
            notificationTimer -= dt;
            if (notificationTimer <= 0) {
              const nextQueued = notificationQueue.shift();
              if (nextQueued) {
                notification = {
                  id: nextNotificationId++,
                  messageKey: nextQueued.messageKey,
                  tone: nextQueued.tone,
                };
                notificationTimer = nextQueued.duration;
              } else {
                notification = null;
                notificationTimer = 0;
              }
            }
          }

          publishHud(focused);
        } else {
          // Paused or inside modal or transitioning: keep camera synced at current pose
          camera.position.set(playerX, PLAYER_EYE_HEIGHT, playerZ);
          _euler.set(pitch, yaw, 0, 'YXZ');
          camera.quaternion.setFromEuler(_euler);
          facility.flashlight.intensity = flashlightOn ? 15.0 : 0;

          // Keep objectives reconciled even right after a modal or return transition
          const objRes = reconcileObjectives(
            objectiveState,
            toObjectiveFacts(storyProgress)
          );
          objectiveState = objRes.next;
          if (objRes.newlyCompleted.length > 0) {
            audio.playObjectiveComplete();
            enqueueNotification('obj.completedToast', 'success', 2.2);
          }

          publishHud(null);
        }
      }

      justPressed.clear();
      const activeScene = memoryHandles ? memoryHandles.scene : scene;
      renderer.render(activeScene, camera);

      if (isSoftwareGl) {
        afterDraw(() => tick());
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      frameId = window.setTimeout(() => tick(), 16);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);

      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearInputs);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);

      exitLock();
      disposeActiveMemory();
      audio.dispose();
      facility.dispose();
      facilityRef.current = null;
      envTarget.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
      controllerRef.current = null;
    };
  }, [controllerRef]);

  return (
    <div
      ref={mountRef}
      dir="ltr"
      data-testid="game-viewport"
      className="fixed inset-0 z-0 bg-[#04080d]"
    />
  );
};
