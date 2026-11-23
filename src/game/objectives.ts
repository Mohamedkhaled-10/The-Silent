import { TranslationKey } from '../i18n';

export type ObjectiveId =
  | 'obj_corridor'
  | 'obj_observation'
  | 'obj_terminal'
  | 'obj_record'
  | 'obj_access_card'
  | 'obj_enter_wing'
  | 'obj_analysis_console'
  | 'obj_first_recall'
  | 'obj_post_memory';

export interface ObjectiveDef {
  id: ObjectiveId;
  stepNumber: number;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}

export const OBJECTIVE_DEFS: readonly ObjectiveDef[] = [
  {
    id: 'obj_corridor',
    stepNumber: 1,
    titleKey: 'obj.corridor.title',
    descKey: 'obj.corridor.desc',
  },
  {
    id: 'obj_observation',
    stepNumber: 2,
    titleKey: 'obj.observation.title',
    descKey: 'obj.observation.desc',
  },
  {
    id: 'obj_terminal',
    stepNumber: 3,
    titleKey: 'obj.terminal.title',
    descKey: 'obj.terminal.desc',
  },
  {
    id: 'obj_record',
    stepNumber: 4,
    titleKey: 'obj.record.title',
    descKey: 'obj.record.desc',
  },
  {
    id: 'obj_access_card',
    stepNumber: 5,
    titleKey: 'obj.accessCard.title',
    descKey: 'obj.accessCard.desc',
  },
  {
    id: 'obj_enter_wing',
    stepNumber: 6,
    titleKey: 'obj.enterWing.title',
    descKey: 'obj.enterWing.desc',
  },
  {
    id: 'obj_analysis_console',
    stepNumber: 7,
    titleKey: 'obj.analysisConsole.title',
    descKey: 'obj.analysisConsole.desc',
  },
  {
    id: 'obj_first_recall',
    stepNumber: 8,
    titleKey: 'obj.firstRecall.title',
    descKey: 'obj.firstRecall.desc',
  },
  {
    id: 'obj_post_memory',
    stepNumber: 9,
    titleKey: 'obj.postMemory.title',
    descKey: 'obj.postMemory.desc',
  },
] as const;

export interface ObjectiveFacts {
  enteredCorridor: boolean;
  enteredObservation: boolean;
  terminalActivated: boolean;
  recordInspected: boolean;
  accessCardCollected: boolean;
  doorUnlocked: boolean;
  enteredMemoryWing: boolean;
  analysisConsoleInspected: boolean;
  memoryFragmentCompleted: boolean;
  postMemoryReviewed: boolean;
}

export interface ObjectiveProgressState {
  activeIndex: number;
  completedIds: ObjectiveId[];
  notifiedCompletedIds: ObjectiveId[];
}

export function createInitialObjectiveState(): ObjectiveProgressState {
  return {
    activeIndex: 0,
    completedIds: [],
    notifiedCompletedIds: [],
  };
}

export function isObjectiveSatisfied(
  id: ObjectiveId,
  facts: ObjectiveFacts
): boolean {
  switch (id) {
    case 'obj_corridor':
      return facts.enteredCorridor;
    case 'obj_observation':
      return facts.enteredObservation;
    case 'obj_terminal':
      return facts.terminalActivated;
    case 'obj_record':
      return facts.recordInspected;
    case 'obj_access_card':
      return facts.accessCardCollected;
    case 'obj_enter_wing':
      return facts.doorUnlocked && facts.enteredMemoryWing;
    case 'obj_analysis_console':
      return facts.analysisConsoleInspected;
    case 'obj_first_recall':
      return facts.memoryFragmentCompleted;
    case 'obj_post_memory':
      return facts.memoryFragmentCompleted && facts.postMemoryReviewed;
  }
}

export function getCurrentObjectiveDef(
  state: ObjectiveProgressState
): ObjectiveDef | null {
  if (state.activeIndex < 0 || state.activeIndex >= OBJECTIVE_DEFS.length) {
    return null;
  }
  return OBJECTIVE_DEFS[state.activeIndex];
}

/**
 * Advances objectives strictly in sequence whenever the required gameplay event occurs.
 * Tracks `notifiedCompletedIds` so repeated events never produce duplicate notifications.
 */
export function reconcileObjectives(
  state: ObjectiveProgressState,
  facts: ObjectiveFacts
): { next: ObjectiveProgressState; newlyCompleted: ObjectiveId[] } {
  let idx = state.activeIndex;
  const completed = state.completedIds;
  const notified = state.notifiedCompletedIds;
  const newlyCompleted: ObjectiveId[] = [];
  let nextCompleted: ObjectiveId[] | null = null;
  let nextNotified: ObjectiveId[] | null = null;

  while (idx < OBJECTIVE_DEFS.length) {
    const def = OBJECTIVE_DEFS[idx];
    if (!isObjectiveSatisfied(def.id, facts)) {
      break;
    }

    if (!completed.includes(def.id)) {
      if (!nextCompleted) nextCompleted = [...completed];
      nextCompleted.push(def.id);
    }

    if (!notified.includes(def.id)) {
      if (!nextNotified) nextNotified = [...notified];
      nextNotified.push(def.id);
      newlyCompleted.push(def.id);
    }

    idx += 1;
  }

  if (idx === state.activeIndex && !nextCompleted && !nextNotified) {
    return { next: state, newlyCompleted };
  }

  return {
    next: {
      activeIndex: idx,
      completedIds: nextCompleted ?? completed,
      notifiedCompletedIds: nextNotified ?? notified,
    },
    newlyCompleted,
  };
}
