import { TranslationKey } from '../i18n';
import { AABB2D, FacilityZone, InteractableDef } from './types';

export const PLAYER_EYE_HEIGHT = 1.66;
export const PLAYER_RADIUS = 0.36;
export const PLAYER_WALK_SPEED = 3.15;

export const PLAYER_SPAWN = {
  x: 0,
  z: 1.85,
  yaw: 0, // Faces -Z directly down the corridor sightline
  pitch: 0,
};

/**
 * Facility spatial blueprint (continuous navigable 3D layout):
 * 1. Awakening Chamber: x [-3.2, 3.2], z [-3.0, 3.5]
 *    Doorway to Corridor at z = -3.0, x [-1.05, 1.05]
 * 2. Research Corridor: x [-1.6, 1.6], z [-15.0, -3.0]
 *    Doorway to Observation Room at z = -15.0, x [-1.05, 1.05]
 * 3. Observation Room: x [-4.2, 4.2], z [-21.0, -15.0]
 *    Observation Glass Window at z = -21.0, x [-3.0, 3.0]
 *    Secured East Bulkhead at x = 4.2, z [-19.05, -16.95]
 * 4. Test Bay (beyond North glass, non-walkable): x [-5.0, 5.0], z [-31.0, -21.0]
 * 5. Memory Analysis Wing (connected East of Observation Room):
 *    5a. Entry Vestibule: x [4.4, 8.6], z [-20.0, -16.0]
 *    5b. Memory Analysis Laboratory: x [8.6, 17.6], z [-23.0, -13.0]
 *    5c. Neural Reconstruction Core Bay (beyond East glass at x = 17.6): x [17.6, 22.0]
 */
export const FACILITY_COLLIDERS: AABB2D[] = [
  // --- Awakening Chamber Outer Walls ---
  { minX: -3.5, maxX: 3.5, minZ: 3.45, maxZ: 3.8, tag: 'awakening-south-wall' },
  { minX: -3.5, maxX: -3.15, minZ: -3.1, maxZ: 3.6, tag: 'awakening-west-wall' },
  { minX: 3.15, maxX: 3.5, minZ: -3.1, maxZ: 3.6, tag: 'awakening-east-wall' },
  // Awakening -> Corridor bulkhead wall (leaves x [-1.05, 1.05] open)
  { minX: -3.5, maxX: -1.05, minZ: -3.15, maxZ: -2.85, tag: 'bulkhead-1-west' },
  { minX: 1.05, maxX: 3.5, minZ: -3.15, maxZ: -2.85, tag: 'bulkhead-1-east' },

  // --- Research Corridor Side Walls ---
  { minX: -1.85, maxX: -1.55, minZ: -15.1, maxZ: -2.9, tag: 'corridor-west-wall' },
  { minX: 1.55, maxX: 1.85, minZ: -15.1, maxZ: -2.9, tag: 'corridor-east-wall' },
  // Corridor structural pilaster trims (keep clear width >= 2.6m)
  { minX: -1.62, maxX: -1.32, minZ: -6.15, maxZ: -5.85, tag: 'corridor-rib-1w' },
  { minX: 1.32, maxX: 1.62, minZ: -6.15, maxZ: -5.85, tag: 'corridor-rib-1e' },
  { minX: -1.62, maxX: -1.32, minZ: -9.65, maxZ: -9.35, tag: 'corridor-rib-2w' },
  { minX: 1.32, maxX: 1.62, minZ: -9.65, maxZ: -9.35, tag: 'corridor-rib-2e' },
  { minX: -1.62, maxX: -1.32, minZ: -13.15, maxZ: -12.85, tag: 'corridor-rib-3w' },
  { minX: 1.32, maxX: 1.62, minZ: -13.15, maxZ: -12.85, tag: 'corridor-rib-3e' },

  // Corridor -> Observation Room bulkhead wall (leaves x [-1.05, 1.05] open)
  { minX: -4.4, maxX: -1.05, minZ: -15.15, maxZ: -14.85, tag: 'bulkhead-2-west' },
  { minX: 1.05, maxX: 4.4, minZ: -15.15, maxZ: -14.85, tag: 'bulkhead-2-east' },

  // --- Observation Room Outer Walls & Observation Glass ---
  { minX: -4.5, maxX: -4.15, minZ: -21.2, maxZ: -14.9, tag: 'obs-west-wall' },
  // Observation East bulkhead wall split around secured doorway z [-19.05, -16.95]
  { minX: 4.15, maxX: 4.5, minZ: -21.2, maxZ: -19.05, tag: 'obs-east-wall-north' },
  { minX: 4.15, maxX: 4.5, minZ: -16.95, maxZ: -14.9, tag: 'obs-east-wall-south' },
  // Solid observation window parapet + glass barrier along z = -21.0
  { minX: -4.5, maxX: 4.5, minZ: -21.3, maxZ: -20.88, tag: 'obs-glass-wall' },

  // --- Awakening Chamber Props ---
  { minX: -2.95, maxX: -1.45, minZ: -0.2, maxZ: 2.05, tag: 'medical-bed' },
  { minX: -2.85, maxX: -1.85, minZ: -1.75, maxZ: -0.75, tag: 'telemetry-cart' },
  { minX: 2.35, maxX: 3.15, minZ: -0.3, maxZ: 1.5, tag: 'wall-cabinet' },

  // --- Observation Room Props ---
  // Main control console + Research Terminal in front of observation glass
  { minX: -1.55, maxX: 1.55, minZ: -20.35, maxZ: -19.25, tag: 'obs-main-console' },
  // Archived Research Record desk (left side of observation room)
  { minX: -3.5, maxX: -2.0, minZ: -18.75, maxZ: -17.65, tag: 'obs-record-desk' },
  // Telemetry / Server rack (relocated to north-east corner of observation room)
  { minX: 2.75, maxX: 3.9, minZ: -20.65, maxZ: -19.45, tag: 'obs-server-rack' },
  // Security Stand + Memory Analysis Access Card (south-east corner of observation room)
  { minX: 2.55, maxX: 3.7, minZ: -16.65, maxZ: -15.55, tag: 'obs-access-stand' },

  // --- Memory Analysis Wing: Entry Vestibule (x: 4.4..8.6, z: -20.0..-16.0) ---
  { minX: 4.35, maxX: 8.75, minZ: -20.3, maxZ: -19.95, tag: 'vestibule-north-wall' },
  { minX: 4.35, maxX: 8.75, minZ: -16.05, maxZ: -15.7, tag: 'vestibule-south-wall' },
  // Open portal frame into Memory Analysis Laboratory (leaves z [-19.25, -16.75] open)
  { minX: 8.45, maxX: 8.78, minZ: -23.1, maxZ: -19.25, tag: 'vestibule-east-north' },
  { minX: 8.45, maxX: 8.78, minZ: -16.75, maxZ: -12.9, tag: 'vestibule-east-south' },

  // --- Memory Analysis Wing: Laboratory (x: 8.6..17.6, z: -23.0..-13.0) ---
  { minX: 8.5, maxX: 17.8, minZ: -23.3, maxZ: -22.95, tag: 'lab-north-wall' },
  { minX: 8.5, maxX: 17.8, minZ: -13.05, maxZ: -12.7, tag: 'lab-south-wall' },
  // East observation glass partition into Reconstruction Core Bay (x = 17.6)
  { minX: 17.48, maxX: 17.9, minZ: -23.2, maxZ: -12.8, tag: 'lab-east-glass-wall' },

  // --- Memory Analysis Wing Props ---
  { minX: 13.45, maxX: 15.15, minZ: -19.15, maxZ: -16.85, tag: 'lab-memory-console' },
  { minX: 10.65, maxX: 12.15, minZ: -22.45, maxZ: -21.25, tag: 'lab-neural-scan-station' },
  { minX: 10.65, maxX: 12.15, minZ: -14.75, maxZ: -13.55, tag: 'lab-session-report-desk' },
  { minX: 15.95, maxX: 17.15, minZ: -22.35, maxZ: -20.85, tag: 'lab-cryo-tower-north' },
  { minX: 15.95, maxX: 17.15, minZ: -15.15, maxZ: -13.65, tag: 'lab-cryo-tower-south' },
];

export const SECURITY_DOOR_COLLIDER: AABB2D = {
  minX: 4.02,
  maxX: 4.58,
  minZ: -19.05,
  maxZ: -16.95,
  tag: 'security-bulkhead-door',
};

const COLLIDERS_WITH_DOOR: AABB2D[] = [
  ...FACILITY_COLLIDERS,
  SECURITY_DOOR_COLLIDER,
];

/**
 * Returns the active collider set based on the security bulkhead's animated opening progress.
 * Prevents walking through the doorway until unlocked and opened past threshold (0.78).
 */
export function getActiveColliders(doorOpenProgress: number): AABB2D[] {
  return doorOpenProgress >= 0.78 ? FACILITY_COLLIDERS : COLLIDERS_WITH_DOOR;
}

export const INTERACTABLES: InteractableDef[] = [
  {
    id: 'terminal',
    modal: 'terminal',
    promptKey: 'interact.terminal',
    position: { x: 0, y: 1.25, z: -19.65 },
    maxDistance: 2.75,
    minLookDot: 0.52,
  },
  {
    id: 'record',
    modal: 'record',
    promptKey: 'interact.record',
    position: { x: -2.65, y: 0.92, z: -18.15 },
    maxDistance: 2.65,
    minLookDot: 0.48,
  },
  {
    id: 'access_card',
    modal: null,
    promptKey: 'interact.accessCard',
    position: { x: 3.1, y: 0.88, z: -16.1 },
    maxDistance: 2.65,
    minLookDot: 0.45,
  },
  {
    id: 'security_door',
    modal: null,
    promptKey: 'interact.securityDoorLocked',
    position: { x: 4.16, y: 1.32, z: -18.0 },
    maxDistance: 2.85,
    minLookDot: 0.42,
  },
  {
    id: 'neural_scan',
    modal: 'neuralScan',
    promptKey: 'interact.neuralScan',
    position: { x: 11.4, y: 1.26, z: -21.75 },
    maxDistance: 2.75,
    minLookDot: 0.48,
  },
  {
    id: 'session_report',
    modal: 'sessionReport',
    promptKey: 'interact.sessionReport',
    position: { x: 11.4, y: 0.88, z: -14.15 },
    maxDistance: 2.75,
    minLookDot: 0.48,
  },
  {
    id: 'memory_console',
    modal: 'memoryConsole',
    promptKey: 'interact.memoryConsole',
    position: { x: 14.15, y: 1.28, z: -18.0 },
    maxDistance: 2.95,
    minLookDot: 0.48,
  },
];

export interface TerminalLineDef {
  key: TranslationKey;
  variant: 'header' | 'normal' | 'alert';
}

export const TERMINAL_LINE_DEFS: TerminalLineDef[] = [
  { key: 'terminal.project', variant: 'header' },
  { key: 'terminal.program', variant: 'header' },
  { key: 'terminal.subject', variant: 'normal' },
  { key: 'terminal.cognitiveResponse', variant: 'normal' },
  { key: 'terminal.identityStatus', variant: 'alert' },
  { key: 'terminal.recoverySession', variant: 'alert' },
];

export const MEMORY_CONSOLE_LINE_DEFS: TerminalLineDef[] = [
  { key: 'memoryConsole.project', variant: 'header' },
  { key: 'memoryConsole.system', variant: 'header' },
  { key: 'memoryConsole.subject', variant: 'normal' },
  { key: 'memoryConsole.memoryData', variant: 'normal' },
  { key: 'memoryConsole.reconstructionStatus', variant: 'alert' },
  { key: 'memoryConsole.previousSession', variant: 'alert' },
];

export const ARCHIVED_RECORD_PARAGRAPH_KEYS: TranslationKey[] = [
  'record.p1',
  'record.p2',
  'record.p3',
];

export function getZoneAt(x: number, z: number): FacilityZone {
  if (x >= 4.45) {
    return 'zone.memoryWing';
  }
  if (z > -3.0) {
    return 'zone.awakening';
  }
  if (z > -15.0) {
    return 'zone.corridor';
  }
  return 'zone.observation';
}

export interface InteractableContext {
  hasAccessCard?: boolean;
  doorUnlocked?: boolean;
}

export function findFocusedInteractable(
  camX: number,
  camY: number,
  camZ: number,
  forwardX: number,
  forwardY: number,
  forwardZ: number,
  interactables: InteractableDef[] = INTERACTABLES,
  context: InteractableContext = {}
): InteractableDef | null {
  let best: InteractableDef | null = null;
  let bestScore = -Infinity;

  for (const item of interactables) {
    if (item.id === 'access_card' && context.hasAccessCard) continue;
    if (item.id === 'security_door' && context.doorUnlocked) continue;

    const dx = item.position.x - camX;
    const dy = item.position.y - camY;
    const dz = item.position.z - camZ;
    const dist = Math.hypot(dx, dy, dz);
    if (dist > item.maxDistance || dist < 0.05) continue;

    const invDist = 1 / dist;
    const dot =
      (dx * invDist) * forwardX +
      (dy * invDist) * forwardY +
      (dz * invDist) * forwardZ;

    if (dot >= item.minLookDot && dot > bestScore) {
      bestScore = dot;
      best = item;
    }
  }

  return best;
}

