import { AABB2D, Vec2 } from './types';

/**
 * Resolves 2D circle-vs-AABB collision with smooth wall sliding.
 * Tests X and Z axes independently + iterative push-out so corners never snag.
 */
export function resolveMovement(
  current: Vec2,
  deltaX: number,
  deltaZ: number,
  radius: number,
  colliders: AABB2D[]
): Vec2 {
  let x = current.x + deltaX;
  let z = current.z;

  // Resolve X step
  x = pushOutAxisX(x, z, radius, colliders);

  // Resolve Z step
  z += deltaZ;
  z = pushOutAxisZ(x, z, radius, colliders);

  // Second pass handles diagonal corners cleanly
  for (let pass = 0; pass < 2; pass++) {
    for (const box of colliders) {
      const closestX = Math.max(box.minX, Math.min(x, box.maxX));
      const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));
      const dx = x - closestX;
      const dz = z - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        if (distSq > 1e-8) {
          const dist = Math.sqrt(distSq);
          const overlap = radius - dist;
          x += (dx / dist) * overlap;
          z += (dz / dist) * overlap;
        } else {
          // Center inside AABB fallback: push toward nearest edge
          const leftPen = x - box.minX;
          const rightPen = box.maxX - x;
          const topPen = z - box.minZ;
          const bottomPen = box.maxZ - z;
          const minPen = Math.min(leftPen, rightPen, topPen, bottomPen);
          if (minPen === leftPen) x = box.minX - radius;
          else if (minPen === rightPen) x = box.maxX + radius;
          else if (minPen === topPen) z = box.minZ - radius;
          else z = box.maxZ + radius;
        }
      }
    }
  }

  return { x, z };
}

function pushOutAxisX(
  x: number,
  z: number,
  radius: number,
  colliders: AABB2D[]
): number {
  let outX = x;
  for (const box of colliders) {
    if (z + radius <= box.minZ || z - radius >= box.maxZ) continue;
    const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));
    const dz = z - closestZ;
    const maxDx = Math.sqrt(Math.max(0, radius * radius - dz * dz));

    if (outX >= box.minX && outX <= box.maxX) {
      const distLeft = outX - box.minX;
      const distRight = box.maxX - outX;
      outX = distLeft < distRight ? box.minX - maxDx : box.maxX + maxDx;
    } else if (outX < box.minX && outX + maxDx > box.minX) {
      outX = box.minX - maxDx;
    } else if (outX > box.maxX && outX - maxDx < box.maxX) {
      outX = box.maxX + maxDx;
    }
  }
  return outX;
}

function pushOutAxisZ(
  x: number,
  z: number,
  radius: number,
  colliders: AABB2D[]
): number {
  let outZ = z;
  for (const box of colliders) {
    if (x + radius <= box.minX || x - radius >= box.maxX) continue;
    const closestX = Math.max(box.minX, Math.min(x, box.maxX));
    const dx = x - closestX;
    const maxDz = Math.sqrt(Math.max(0, radius * radius - dx * dx));

    if (outZ >= box.minZ && outZ <= box.maxZ) {
      const distTop = outZ - box.minZ;
      const distBottom = box.maxZ - outZ;
      outZ = distTop < distBottom ? box.minZ - maxDz : box.maxZ + maxDz;
    } else if (outZ < box.minZ && outZ + maxDz > box.minZ) {
      outZ = box.minZ - maxDz;
    } else if (outZ > box.maxZ && outZ - maxDz < box.maxZ) {
      outZ = box.maxZ + maxDz;
    }
  }
  return outZ;
}
