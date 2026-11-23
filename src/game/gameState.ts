import { FacilityZone, SightingStage } from './types';
import { ObjectiveFacts } from './objectives';

export interface StoryProgressState {
  enteredCorridor: boolean;
  enteredObservation: boolean;
  enteredMemoryWing: boolean;
  terminalActivated: boolean;
  recordInspected: boolean;
  hasAccessCard: boolean;
  doorUnlocked: boolean;
  doorOpenProgress: number; // 0 = closed, 1 = fully open
  neuralScanInspected: boolean;
  sessionReportInspected: boolean;
  analysisConsoleInspected: boolean;
  memoryFragmentCompleted: boolean;
  postMemoryReviewed: boolean;
  sightingStage: SightingStage;
  sightingTimer: number;
}

export const SIGHTING_TIMINGS = {
  pendingDuration: 0.45,
  appearingDuration: 0.25,
  visibleDuration: 2.7,
  flickerDuration: 0.22,
};

export const DOOR_OPEN_DURATION = 0.85;

export function createInitialStoryProgress(): StoryProgressState {
  return {
    enteredCorridor: false,
    enteredObservation: false,
    enteredMemoryWing: false,
    terminalActivated: false,
    recordInspected: false,
    hasAccessCard: false,
    doorUnlocked: false,
    doorOpenProgress: 0,
    neuralScanInspected: false,
    sessionReportInspected: false,
    analysisConsoleInspected: false,
    memoryFragmentCompleted: false,
    postMemoryReviewed: false,
    sightingStage: 'idle',
    sightingTimer: 0,
  };
}

export function markZoneVisited(
  state: StoryProgressState,
  zone: FacilityZone
): StoryProgressState {
  if (zone === 'zone.corridor' && !state.enteredCorridor) {
    return { ...state, enteredCorridor: true };
  }
  if (zone === 'zone.observation' && !state.enteredObservation) {
    return { ...state, enteredObservation: true };
  }
  if (zone === 'zone.memoryWing' && !state.enteredMemoryWing) {
    return { ...state, enteredMemoryWing: true };
  }
  return state;
}

export function markTerminalActivated(
  state: StoryProgressState
): StoryProgressState {
  if (state.terminalActivated) return state;
  return {
    ...state,
    terminalActivated: true,
  };
}

export function markRecordInspected(
  state: StoryProgressState
): StoryProgressState {
  if (state.recordInspected) return state;
  return {
    ...state,
    recordInspected: true,
  };
}

export function markAccessCardCollected(
  state: StoryProgressState
): StoryProgressState {
  if (state.hasAccessCard) return state;
  return {
    ...state,
    hasAccessCard: true,
  };
}

export function tryUnlockSecurityDoor(state: StoryProgressState): {
  next: StoryProgressState;
  granted: boolean;
  alreadyUnlocked: boolean;
} {
  if (state.doorUnlocked) {
    return { next: state, granted: true, alreadyUnlocked: true };
  }
  if (!state.hasAccessCard) {
    return { next: state, granted: false, alreadyUnlocked: false };
  }
  return {
    next: {
      ...state,
      doorUnlocked: true,
    },
    granted: true,
    alreadyUnlocked: false,
  };
}

export function stepSecurityDoor(
  state: StoryProgressState,
  dt: number
): StoryProgressState {
  if (!state.doorUnlocked || state.doorOpenProgress >= 1) {
    return state;
  }
  const nextProgress = Math.min(
    1,
    state.doorOpenProgress + dt / DOOR_OPEN_DURATION
  );
  return {
    ...state,
    doorOpenProgress: nextProgress,
  };
}

export function markNeuralScanInspected(
  state: StoryProgressState
): StoryProgressState {
  if (state.neuralScanInspected) return state;
  return { ...state, neuralScanInspected: true };
}

export function markSessionReportInspected(
  state: StoryProgressState
): StoryProgressState {
  if (state.sessionReportInspected) return state;
  return { ...state, sessionReportInspected: true };
}

export function markAnalysisConsoleInspected(
  state: StoryProgressState
): StoryProgressState {
  if (state.analysisConsoleInspected) return state;
  return { ...state, analysisConsoleInspected: true };
}

export function markMemoryFragmentCompleted(
  state: StoryProgressState
): StoryProgressState {
  if (state.memoryFragmentCompleted) return state;
  return { ...state, memoryFragmentCompleted: true };
}

export function markPostMemoryReviewed(
  state: StoryProgressState
): StoryProgressState {
  if (state.postMemoryReviewed) return state;
  return { ...state, postMemoryReviewed: true };
}

export function toObjectiveFacts(state: StoryProgressState): ObjectiveFacts {
  return {
    enteredCorridor: state.enteredCorridor,
    enteredObservation: state.enteredObservation,
    terminalActivated: state.terminalActivated,
    recordInspected: state.recordInspected,
    accessCardCollected: state.hasAccessCard,
    doorUnlocked: state.doorUnlocked,
    enteredMemoryWing: state.enteredMemoryWing,
    analysisConsoleInspected: state.analysisConsoleInspected,
    memoryFragmentCompleted: state.memoryFragmentCompleted,
    postMemoryReviewed: state.postMemoryReviewed,
  };
}

/**
 * Triggers the First Mysterious Sighting when the player closes the terminal
 * after activating it for the first time, ensuring unobstructed view of the glass.
 */
export function triggerSightingIfReady(
  state: StoryProgressState
): StoryProgressState {
  if (!state.terminalActivated || state.sightingStage !== 'idle') {
    return state;
  }
  return {
    ...state,
    sightingStage: 'pending',
    sightingTimer: 0,
  };
}

export interface SightingVisualState {
  silhouetteVisible: boolean;
  silhouetteOpacity: number;
  lightFactor: number; // 1.0 = normal, < 1.0 = subtle interruption dip
  justStartedAppear: boolean;
  justStartedFlicker: boolean;
  justCompleted: boolean;
}

export function stepSighting(
  state: StoryProgressState,
  dt: number
): { next: StoryProgressState; visual: SightingVisualState } {
  const visual: SightingVisualState = {
    silhouetteVisible: false,
    silhouetteOpacity: 0,
    lightFactor: 1,
    justStartedAppear: false,
    justStartedFlicker: false,
    justCompleted: false,
  };

  if (state.sightingStage === 'idle' || state.sightingStage === 'completed') {
    return { next: state, visual };
  }

  let stage: SightingStage = state.sightingStage;
  let timer = state.sightingTimer + dt;

  if (stage === 'pending') {
    if (timer >= SIGHTING_TIMINGS.pendingDuration) {
      stage = 'appearing';
      timer -= SIGHTING_TIMINGS.pendingDuration;
      visual.justStartedAppear = true;
    }
  }

  if (stage === 'appearing') {
    const t = Math.min(1, timer / SIGHTING_TIMINGS.appearingDuration);
    visual.silhouetteVisible = true;
    visual.silhouetteOpacity = t;
    visual.lightFactor = 0.45 + 0.55 * t;
    if (timer >= SIGHTING_TIMINGS.appearingDuration) {
      stage = 'visible';
      timer -= SIGHTING_TIMINGS.appearingDuration;
    }
  }

  if (stage === 'visible') {
    visual.silhouetteVisible = true;
    visual.silhouetteOpacity = 1;
    visual.lightFactor = 1;
    if (timer >= SIGHTING_TIMINGS.visibleDuration) {
      stage = 'flicker';
      timer -= SIGHTING_TIMINGS.visibleDuration;
      visual.justStartedFlicker = true;
    }
  }

  if (stage === 'flicker') {
    // Subtle lighting interruption during which the silhouette vanishes
    const progress = Math.min(1, timer / SIGHTING_TIMINGS.flickerDuration);
    visual.lightFactor = progress < 0.5 ? 0.18 : 0.25 + 0.75 * ((progress - 0.5) * 2);
    visual.silhouetteVisible = false;
    visual.silhouetteOpacity = 0;
    if (timer >= SIGHTING_TIMINGS.flickerDuration) {
      stage = 'completed';
      timer = 0;
      visual.lightFactor = 1;
      visual.justCompleted = true;
    }
  }

  return {
    next: {
      ...state,
      sightingStage: stage,
      sightingTimer: timer,
    },
    visual,
  };
}

