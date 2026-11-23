import { TranslationKey } from '../i18n';
import { EvidenceId } from './evidence';
import { MemoryHudSummary } from './memory/memoryTypes';
import { ObjectiveId } from './objectives';

export type GamePhase = 'title' | 'playing' | 'paused';

export type ActiveModal =
  | 'none'
  | 'terminal'
  | 'record'
  | 'journal'
  | 'neuralScan'
  | 'sessionReport'
  | 'memoryConsole';

export type FacilityZone =
  | 'zone.awakening'
  | 'zone.corridor'
  | 'zone.observation'
  | 'zone.memoryWing';

export type SightingStage =
  | 'idle'
  | 'pending'
  | 'appearing'
  | 'visible'
  | 'flicker'
  | 'completed';

export type InteractableId =
  | 'terminal'
  | 'record'
  | 'access_card'
  | 'security_door'
  | 'neural_scan'
  | 'session_report'
  | 'memory_console';

export interface AABB2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  tag?: string;
}

export interface Vec2 {
  x: number;
  z: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface InteractableDef {
  id: InteractableId;
  modal: Exclude<ActiveModal, 'none' | 'journal'> | null;
  promptKey: TranslationKey;
  position: Vec3;
  maxDistance: number;
  minLookDot: number;
}

export type NotificationTone = 'info' | 'success' | 'warning' | 'danger';

export interface HudNotification {
  id: number;
  messageKey: TranslationKey;
  tone: NotificationTone;
}

export interface HudState {
  phase: GamePhase;
  modal: ActiveModal;
  zone: FacilityZone;
  flashlightOn: boolean;
  muted: boolean;
  pointerLocked: boolean;
  focusedInteractable: InteractableDef | null;
  terminalActivated: boolean;
  recordInspected: boolean;
  hasAccessCard: boolean;
  doorUnlocked: boolean;
  analysisConsoleInspected: boolean;
  memoryFragmentCompleted: boolean;
  postMemoryReviewed: boolean;
  sightingStage: SightingStage;
  statusNoteKey: TranslationKey | null;
  activeObjectiveId: ObjectiveId | null;
  completedObjectiveIds: ObjectiveId[];
  discoveredEvidenceIds: EvidenceId[];
  notification: HudNotification | null;
  memory: MemoryHudSummary;
}

