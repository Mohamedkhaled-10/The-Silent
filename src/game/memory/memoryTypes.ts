import { TranslationKey } from '../../i18n';
import { AABB2D, Vec3 } from '../types';

export type MemoryFragmentId = 'memory_fragment_01';

export type MemoryPerspectiveMode = 'immersion' | 'observer';

export type MemoryPhaseStage =
  | 'inactive'
  | 'immersion'
  | 'observer_transition'
  | 'observer'
  | 'collapse';

export type MemoryAnomalyId =
  | 'frozen_clock'
  | 'changing_photo'
  | 'impossible_call';

export type MemoryZoneId =
  | 'memory.zone.entrance'
  | 'memory.zone.living'
  | 'memory.zone.study';

export type MemoryInteractableId =
  | 'clock'
  | 'photo'
  | 'phone'
  | 'recorder'
  | 'interior_door';

export interface MemoryFacilitySnapshot {
  playerX: number;
  playerZ: number;
  yaw: number;
  pitch: number;
  flashlightOn: boolean;
}

export interface MemoryInteractableDef {
  id: MemoryInteractableId;
  position: Vec3;
  maxDistance: number;
  minLookDot: number;
}

export interface MemorySpawnDef {
  x: number;
  z: number;
  yaw: number;
  pitch: number;
}

export interface MemoryFragmentDefinition {
  id: MemoryFragmentId;
  titleKey: TranslationKey;
  codeKey: TranslationKey;
  ownerKnown: false;
  spawn: MemorySpawnDef;
  colliders: AABB2D[];
  interactables: MemoryInteractableDef[];
  requiredAnomalies: readonly MemoryAnomalyId[];
  photoPosition: Vec3;
}

export interface MemorySessionState {
  fragmentId: MemoryFragmentId;
  stage: MemoryPhaseStage;
  mode: MemoryPerspectiveMode;
  facilitySnapshot: MemoryFacilitySnapshot;
  discoveredAnomalies: MemoryAnomalyId[];
  clockInspectedOnce: boolean;
  photoInspectedOnce: boolean;
  photoLeftAfterInspect: boolean;
  photoChanged: boolean;
  recorderInspected: boolean;
  observerTransitionTimer: number;
  echoTimer: number;
  echoCycleCount: number;
  echoChangedDetail: boolean;
  discrepancyInteractableReady: boolean;
  collapseTimer: number;
  readyToExit: boolean;
}

export type MemoryTransitionPhase = 'none' | 'fading_out' | 'fading_in';

export interface MemoryHudSummary {
  active: boolean;
  fragmentId: MemoryFragmentId | null;
  mode: MemoryPerspectiveMode;
  stage: MemoryPhaseStage;
  zone: MemoryZoneId;
  anomaliesFound: number;
  anomaliesTotal: number;
  discrepancyReady: boolean;
  echoCycleCount: number;
  subtitleKey: TranslationKey | null;
  focusedPromptKey: TranslationKey | null;
  transitionPhase: MemoryTransitionPhase;
  transitionLabelKey: TranslationKey | null;
}
