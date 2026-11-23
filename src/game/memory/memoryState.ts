import { REQUIRED_FRAGMENT_01_ANOMALIES, getMemoryFragmentDef } from './memoryData';
import {
  MemoryAnomalyId,
  MemoryFacilitySnapshot,
  MemoryFragmentId,
  MemorySessionState,
} from './memoryTypes';

export const OBSERVER_TRANSITION_DURATION = 1.1;
export const ECHO_CYCLE_DURATION = 4.2;
export const MEMORY_COLLAPSE_DURATION = 2.95;

export function createMemorySession(
  fragmentId: MemoryFragmentId,
  facilitySnapshot: MemoryFacilitySnapshot
): MemorySessionState {
  return {
    fragmentId,
    stage: 'immersion',
    mode: 'immersion',
    facilitySnapshot: { ...facilitySnapshot },
    discoveredAnomalies: [],
    clockInspectedOnce: false,
    photoInspectedOnce: false,
    photoLeftAfterInspect: false,
    photoChanged: false,
    recorderInspected: false,
    observerTransitionTimer: 0,
    echoTimer: 0,
    echoCycleCount: 0,
    echoChangedDetail: false,
    discrepancyInteractableReady: false,
    collapseTimer: 0,
    readyToExit: false,
  };
}

export function discoverMemoryAnomaly(
  state: MemorySessionState,
  anomalyId: MemoryAnomalyId
): { next: MemorySessionState; added: boolean; enteredObserverTransition: boolean } {
  if (state.discoveredAnomalies.includes(anomalyId)) {
    return {
      next: state,
      added: false,
      enteredObserverTransition: false,
    };
  }

  const nextAnomalies = [...state.discoveredAnomalies, anomalyId];
  const def = getMemoryFragmentDef(state.fragmentId);
  const allFound = def.requiredAnomalies.every((id) =>
    nextAnomalies.includes(id)
  );

  // Only advance toward Observer Mode from Immersion Mode once all 3 anomalies are discovered
  const shouldEnterObserver = allFound && state.stage === 'immersion';

  return {
    next: {
      ...state,
      discoveredAnomalies: nextAnomalies,
      stage: shouldEnterObserver ? 'observer_transition' : state.stage,
      observerTransitionTimer: shouldEnterObserver
        ? 0
        : state.observerTransitionTimer,
    },
    added: true,
    enteredObserverTransition: shouldEnterObserver,
  };
}

/**
 * Updates photograph state once the player inspects it and subsequently moves away
 * or looks away from the frame in the Living Room.
 */
export function updatePhotoAwayState(
  state: MemorySessionState,
  camX: number,
  camZ: number,
  forwardX: number,
  forwardZ: number
): MemorySessionState {
  if (!state.photoInspectedOnce || state.photoChanged) {
    return state;
  }

  const def = getMemoryFragmentDef(state.fragmentId);
  const dx = def.photoPosition.x - camX;
  const dz = def.photoPosition.z - camZ;
  const dist = Math.hypot(dx, dz);

  // Player stepped further into the apartment (> 3.0m) OR turned away from the photograph
  const normDot = dist > 0.01 ? (dx * forwardX + dz * forwardZ) / dist : 1;
  const steppedOrLookedAway = dist >= 3.0 || (dist >= 1.65 && normDot < 0.15);

  if (!steppedOrLookedAway) {
    return state;
  }

  return {
    ...state,
    photoLeftAfterInspect: true,
    photoChanged: true,
  };
}

export interface MemoryStepResult {
  next: MemorySessionState;
  justEnteredObserver: boolean;
  justChangedEchoDetail: boolean;
  justCompletedCollapse: boolean;
}

/**
 * Pure simulation step for Observer transition, Echo repetition cycles, and Collapse countdown.
 */
export function stepMemorySimulation(
  state: MemorySessionState,
  dt: number
): MemoryStepResult {
  if (state.stage === 'inactive' || state.stage === 'immersion') {
    return {
      next: state,
      justEnteredObserver: false,
      justChangedEchoDetail: false,
      justCompletedCollapse: false,
    };
  }

  if (state.stage === 'observer_transition') {
    const nextTimer = state.observerTransitionTimer + dt;
    if (nextTimer >= OBSERVER_TRANSITION_DURATION) {
      return {
        next: {
          ...state,
          stage: 'observer',
          mode: 'observer',
          observerTransitionTimer: OBSERVER_TRANSITION_DURATION,
          echoTimer: 0,
          echoCycleCount: 1,
        },
        justEnteredObserver: true,
        justChangedEchoDetail: false,
        justCompletedCollapse: false,
      };
    }
    return {
      next: {
        ...state,
        observerTransitionTimer: nextTimer,
      },
      justEnteredObserver: false,
      justChangedEchoDetail: false,
      justCompletedCollapse: false,
    };
  }

  if (state.stage === 'observer') {
    let echoTimer = state.echoTimer + dt;
    let echoCycleCount = state.echoCycleCount;
    let echoChangedDetail = state.echoChangedDetail;
    let discrepancyReady = state.discrepancyInteractableReady;
    let justChangedEchoDetail = false;

    while (echoTimer >= ECHO_CYCLE_DURATION) {
      echoTimer -= ECHO_CYCLE_DURATION;
      echoCycleCount += 1;
      if (echoCycleCount >= 2 && !echoChangedDetail) {
        echoChangedDetail = true;
        discrepancyReady = true;
        justChangedEchoDetail = true;
      }
    }

    if (
      echoTimer === state.echoTimer &&
      echoCycleCount === state.echoCycleCount &&
      echoChangedDetail === state.echoChangedDetail
    ) {
      return {
        next: state,
        justEnteredObserver: false,
        justChangedEchoDetail: false,
        justCompletedCollapse: false,
      };
    }

    return {
      next: {
        ...state,
        echoTimer,
        echoCycleCount,
        echoChangedDetail,
        discrepancyInteractableReady: discrepancyReady,
      },
      justEnteredObserver: false,
      justChangedEchoDetail,
      justCompletedCollapse: false,
    };
  }

  if (state.stage === 'collapse') {
    if (state.readyToExit) {
      return {
        next: state,
        justEnteredObserver: false,
        justChangedEchoDetail: false,
        justCompletedCollapse: false,
      };
    }
    const nextCollapseTimer = state.collapseTimer + dt;
    const done = nextCollapseTimer >= MEMORY_COLLAPSE_DURATION;
    return {
      next: {
        ...state,
        collapseTimer: nextCollapseTimer,
        readyToExit: done,
      },
      justEnteredObserver: false,
      justChangedEchoDetail: false,
      justCompletedCollapse: done,
    };
  }

  return {
    next: state,
    justEnteredObserver: false,
    justChangedEchoDetail: false,
    justCompletedCollapse: false,
  };
}

export function areAllRequiredAnomaliesFound(
  state: MemorySessionState
): boolean {
  return REQUIRED_FRAGMENT_01_ANOMALIES.every((id) =>
    state.discoveredAnomalies.includes(id)
  );
}
