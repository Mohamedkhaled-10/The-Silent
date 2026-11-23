import {
  MemoryAnomalyId,
  MemoryFragmentDefinition,
  MemoryFragmentId,
  MemoryInteractableDef,
  MemoryZoneId,
} from './memoryTypes';

export const REQUIRED_FRAGMENT_01_ANOMALIES: readonly MemoryAnomalyId[] = [
  'frozen_clock',
  'changing_photo',
  'impossible_call',
] as const;

/**
 * Spatial blueprint for MEMORY_FRAGMENT_01 (THE UNFINISHED EVENING):
 * 1. Entrance Hall: x [-1.8, 1.8], z [-2.2, 1.8]
 *    Spawn at (0, 0.85) facing North (-Z) through wide archway x [-1.05, 1.05] into Living Room.
 * 2. Living Room: x [-3.8, 3.6], z [-7.8, -2.2]
 *    - North rain window at z = -7.8, x [-1.4, 1.4]
 *    - Frozen wall clock on NW wall (-2.4, 1.62, -7.66)
 *    - Framed photograph on West credenza (-3.36, 1.12, -4.75)
 *    - Unplugged ringing telephone on East side table (2.48, 0.92, -3.40)
 *    - Doorway to Small Study at x = 3.6, z [-6.2, -4.4] (1.8m wide)
 * 3. Small Study: x [3.6, 7.0], z [-7.6, -2.6]
 *    - Old recording device on East desk (5.95, 0.92, -4.7)
 *    - Closed interior door on North wall (5.15, 1.25, -7.42)
 */
export const MEMORY_FRAGMENT_01_DEF: MemoryFragmentDefinition = {
  id: 'memory_fragment_01',
  titleKey: 'memory.fragmentName',
  codeKey: 'memory.fragmentCode',
  ownerKnown: false,
  spawn: {
    x: 0,
    z: 0.85,
    yaw: 0,
    pitch: 0,
  },
  photoPosition: { x: -3.36, y: 1.12, z: -4.75 },
  requiredAnomalies: REQUIRED_FRAGMENT_01_ANOMALIES,
  colliders: [
    // --- Entrance Hall Outer Walls ---
    { minX: -2.05, maxX: 2.05, minZ: 1.75, maxZ: 2.05, tag: 'mem-hall-south' },
    { minX: -2.05, maxX: -1.78, minZ: -2.25, maxZ: 1.85, tag: 'mem-hall-west' },
    { minX: 1.78, maxX: 2.05, minZ: -2.25, maxZ: 1.85, tag: 'mem-hall-east' },
    // Small entryway shoe/key console along East hall wall
    { minX: 1.15, maxX: 1.78, minZ: -1.1, maxZ: 0.4, tag: 'mem-hall-console' },

    // Partition between Entrance Hall and Living Room (open archway x [-1.05, 1.05])
    { minX: -3.95, maxX: -1.05, minZ: -2.35, maxZ: -2.05, tag: 'mem-south-west' },
    { minX: 1.05, maxX: 3.75, minZ: -2.35, maxZ: -2.05, tag: 'mem-south-east' },

    // --- Living Room Outer Walls ---
    { minX: -4.05, maxX: -3.78, minZ: -7.95, maxZ: -2.1, tag: 'mem-living-west' },
    { minX: -4.05, maxX: 3.75, minZ: -8.05, maxZ: -7.78, tag: 'mem-living-north' },
    // Living Room East wall split around Study doorway z [-6.2, -4.4]
    { minX: 3.48, maxX: 3.75, minZ: -7.95, maxZ: -6.2, tag: 'mem-study-divider-north' },
    { minX: 3.48, maxX: 3.75, minZ: -4.4, maxZ: -2.1, tag: 'mem-study-divider-south' },

    // --- Living Room Furniture ---
    // Sofa + low coffee table island (ample >1.6m paths on every side)
    { minX: -1.35, maxX: 0.75, minZ: -5.9, maxZ: -4.4, tag: 'mem-living-sofa-group' },
    // West credenza holding the changing photograph
    { minX: -3.75, maxX: -3.05, minZ: -5.6, maxZ: -3.9, tag: 'mem-living-credenza' },
    // East side table holding the unplugged telephone
    { minX: 2.05, maxX: 2.95, minZ: -3.85, maxZ: -2.95, tag: 'mem-living-phone-table' },
    // Corner bookshelf NE of Living Room
    { minX: 2.35, maxX: 3.45, minZ: -7.75, maxZ: -7.1, tag: 'mem-living-bookshelf' },

    // --- Small Study Outer Walls ---
    { minX: 3.55, maxX: 7.2, minZ: -7.85, maxZ: -7.58, tag: 'mem-study-north' },
    { minX: 3.55, maxX: 7.2, minZ: -2.65, maxZ: -2.35, tag: 'mem-study-south' },
    { minX: 6.98, maxX: 7.25, minZ: -7.8, maxZ: -2.4, tag: 'mem-study-east' },

    // --- Small Study Furniture ---
    // Wooden desk holding the old recording device
    { minX: 5.55, maxX: 6.75, minZ: -5.7, maxZ: -3.7, tag: 'mem-study-desk' },
  ],
  interactables: [
    {
      id: 'clock',
      position: { x: -2.4, y: 1.62, z: -7.66 },
      maxDistance: 2.8,
      minLookDot: 0.45,
    },
    {
      id: 'photo',
      position: { x: -3.36, y: 1.12, z: -4.75 },
      maxDistance: 2.75,
      minLookDot: 0.45,
    },
    {
      id: 'phone',
      position: { x: 2.48, y: 0.92, z: -3.4 },
      maxDistance: 2.75,
      minLookDot: 0.45,
    },
    {
      id: 'recorder',
      position: { x: 5.95, y: 0.92, z: -4.7 },
      maxDistance: 2.8,
      minLookDot: 0.45,
    },
    {
      id: 'interior_door',
      position: { x: 5.15, y: 1.25, z: -7.42 },
      maxDistance: 2.8,
      minLookDot: 0.44,
    },
  ],
};

export const MEMORY_FRAGMENTS: Record<MemoryFragmentId, MemoryFragmentDefinition> = {
  memory_fragment_01: MEMORY_FRAGMENT_01_DEF,
};

export function getMemoryFragmentDef(
  id: MemoryFragmentId
): MemoryFragmentDefinition {
  return MEMORY_FRAGMENTS[id];
}

export function getMemoryZoneAt(x: number, z: number): MemoryZoneId {
  if (x >= 3.6) {
    return 'memory.zone.study';
  }
  if (z <= -2.2) {
    return 'memory.zone.living';
  }
  return 'memory.zone.entrance';
}

export function findFocusedMemoryInteractable(
  camX: number,
  camY: number,
  camZ: number,
  forwardX: number,
  forwardY: number,
  forwardZ: number,
  interactables: MemoryInteractableDef[] = MEMORY_FRAGMENT_01_DEF.interactables
): MemoryInteractableDef | null {
  let best: MemoryInteractableDef | null = null;
  let bestScore = -Infinity;

  for (const item of interactables) {
    const dx = item.position.x - camX;
    const dy = item.position.y - camY;
    const dz = item.position.z - camZ;
    const dist = Math.hypot(dx, dy, dz);
    if (dist > item.maxDistance || dist < 0.05) continue;

    const invDist = 1 / dist;
    const dot =
      dx * invDist * forwardX +
      dy * invDist * forwardY +
      dz * invDist * forwardZ;

    if (dot >= item.minLookDot && dot > bestScore) {
      bestScore = dot;
      best = item;
    }
  }

  return best;
}
