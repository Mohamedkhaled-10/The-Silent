import { TranslationKey } from '../../i18n';
import { discoverMemoryAnomaly } from './memoryState';
import { MemoryInteractableId, MemorySessionState } from './memoryTypes';

export type MemorySoundEffect =
  | 'none'
  | 'clock_tick'
  | 'photo_shift'
  | 'phone_ring_static'
  | 'recorder_hum'
  | 'door_locked'
  | 'observer_shift'
  | 'collapse';

export interface MemoryInteractionOutcome {
  nextState: MemorySessionState;
  subtitleKey: TranslationKey;
  sound: MemorySoundEffect;
  recordedNewAnomaly: boolean;
  enteredObserverTransition: boolean;
  triggeredCollapse: boolean;
}

/**
 * Returns the contextual interaction prompt key for a focused apartment object.
 */
export function getMemoryInteractPromptKey(
  state: MemorySessionState,
  interactableId: MemoryInteractableId
): TranslationKey {
  switch (interactableId) {
    case 'clock':
      return state.clockInspectedOnce &&
        !state.discoveredAnomalies.includes('frozen_clock')
        ? 'memory.interact.clockReexamine'
        : 'memory.interact.clock';
    case 'photo':
      return state.photoChanged &&
        !state.discoveredAnomalies.includes('changing_photo')
        ? 'memory.interact.photoChanged'
        : 'memory.interact.photo';
    case 'phone':
      return 'memory.interact.phone';
    case 'recorder':
      return 'memory.interact.recorder';
    case 'interior_door':
      return state.discrepancyInteractableReady
        ? 'memory.interact.doorDiscrepancy'
        : 'memory.interact.door';
  }
}

/**
 * Resolves interacting (`E`) with any prop inside MEMORY_FRAGMENT_01.
 * Anomalies can be discovered in any order; Observer Mode and Collapse are strictly gated.
 */
export function interactInMemory(
  state: MemorySessionState,
  interactableId: MemoryInteractableId
): MemoryInteractionOutcome {
  if (state.stage === 'inactive' || state.stage === 'collapse') {
    return {
      nextState: state,
      subtitleKey: 'memory.msg.collapseSubtitle',
      sound: 'none',
      recordedNewAnomaly: false,
      enteredObserverTransition: false,
      triggeredCollapse: false,
    };
  }

  if (interactableId === 'clock') {
    if (!state.clockInspectedOnce) {
      return {
        nextState: {
          ...state,
          clockInspectedOnce: true,
        },
        subtitleKey: 'memory.msg.clockFirst',
        sound: 'clock_tick',
        recordedNewAnomaly: false,
        enteredObserverTransition: false,
        triggeredCollapse: false,
      };
    }
    const res = discoverMemoryAnomaly(state, 'frozen_clock');
    return {
      nextState: res.next,
      subtitleKey: 'memory.msg.clockAnomaly',
      sound: res.enteredObserverTransition ? 'observer_shift' : 'clock_tick',
      recordedNewAnomaly: res.added,
      enteredObserverTransition: res.enteredObserverTransition,
      triggeredCollapse: false,
    };
  }

  if (interactableId === 'photo') {
    if (!state.photoInspectedOnce) {
      return {
        nextState: {
          ...state,
          photoInspectedOnce: true,
        },
        subtitleKey: 'memory.msg.photoFirst',
        sound: 'none',
        recordedNewAnomaly: false,
        enteredObserverTransition: false,
        triggeredCollapse: false,
      };
    }

    if (!state.photoChanged) {
      return {
        nextState: state,
        subtitleKey: 'memory.msg.photoUnchanged',
        sound: 'none',
        recordedNewAnomaly: false,
        enteredObserverTransition: false,
        triggeredCollapse: false,
      };
    }

    const res = discoverMemoryAnomaly(state, 'changing_photo');
    return {
      nextState: res.next,
      subtitleKey: 'memory.msg.photoAnomaly',
      sound: res.enteredObserverTransition ? 'observer_shift' : 'photo_shift',
      recordedNewAnomaly: res.added,
      enteredObserverTransition: res.enteredObserverTransition,
      triggeredCollapse: false,
    };
  }

  if (interactableId === 'phone') {
    const res = discoverMemoryAnomaly(state, 'impossible_call');
    return {
      nextState: res.next,
      subtitleKey: 'memory.msg.callAnomaly',
      sound: res.enteredObserverTransition
        ? 'observer_shift'
        : 'phone_ring_static',
      recordedNewAnomaly: res.added,
      enteredObserverTransition: res.enteredObserverTransition,
      triggeredCollapse: false,
    };
  }

  if (interactableId === 'recorder') {
    return {
      nextState: {
        ...state,
        recorderInspected: true,
      },
      subtitleKey: 'memory.msg.recorderNote',
      sound: 'recorder_hum',
      recordedNewAnomaly: false,
      enteredObserverTransition: false,
      triggeredCollapse: false,
    };
  }

  // Interior door in the Small Study:
  // Locked/ordinary until Observer Mode Cycle >= 2 reveals the spatial discrepancy.
  if (
    state.stage === 'observer' &&
    state.discrepancyInteractableReady
  ) {
    return {
      nextState: {
        ...state,
        stage: 'collapse',
        collapseTimer: 0,
        readyToExit: false,
      },
      subtitleKey: 'memory.msg.collapseSubtitle',
      sound: 'collapse',
      recordedNewAnomaly: false,
      enteredObserverTransition: false,
      triggeredCollapse: true,
    };
  }

  return {
    nextState: state,
    subtitleKey: 'memory.msg.doorLocked',
    sound: 'door_locked',
    recordedNewAnomaly: false,
    enteredObserverTransition: false,
    triggeredCollapse: false,
  };
}
