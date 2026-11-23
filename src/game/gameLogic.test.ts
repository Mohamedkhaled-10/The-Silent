import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMovement } from './collision';
import {
  EVIDENCE_DEFS,
  collectEvidence,
  createInitialEvidenceState,
  isEvidenceDiscovered,
} from './evidence';
import {
  FACILITY_COLLIDERS,
  PLAYER_RADIUS,
  PLAYER_SPAWN,
  findFocusedInteractable,
  getActiveColliders,
  getZoneAt,
} from './facilityData';
import {
  DOOR_OPEN_DURATION,
  createInitialStoryProgress,
  markAccessCardCollected,
  markAnalysisConsoleInspected,
  markMemoryFragmentCompleted,
  markPostMemoryReviewed,
  markRecordInspected,
  markTerminalActivated,
  markZoneVisited,
  stepSecurityDoor,
  stepSighting,
  toObjectiveFacts,
  triggerSightingIfReady,
  tryUnlockSecurityDoor,
} from './gameState';
import {
  MEMORY_FRAGMENT_01_DEF,
  findFocusedMemoryInteractable,
  getMemoryZoneAt,
} from './memory/memoryData';
import { interactInMemory } from './memory/memoryEvents';
import {
  ECHO_CYCLE_DURATION,
  MEMORY_COLLAPSE_DURATION,
  OBSERVER_TRANSITION_DURATION,
  createMemorySession,
  discoverMemoryAnomaly,
  stepMemorySimulation,
  updatePhotoAwayState,
} from './memory/memoryState';
import {
  OBJECTIVE_DEFS,
  createInitialObjectiveState,
  getCurrentObjectiveDef,
  reconcileObjectives,
} from './objectives';

test('player can navigate unobstructed from Awakening Chamber through Corridor to Observation Room', () => {
  let pos = { x: PLAYER_SPAWN.x, z: PLAYER_SPAWN.z };
  assert.equal(getZoneAt(pos.x, pos.z), 'zone.awakening');

  // Walk straight down -Z in small simulation steps from z = 1.85 to z = -18.5
  for (let i = 0; i < 420; i++) {
    pos = resolveMovement(pos, 0, -0.05, PLAYER_RADIUS, FACILITY_COLLIDERS);
  }

  assert.ok(
    pos.z < -18.0,
    `Expected player to reach Observation Room (z < -18), reached z=${pos.z}`
  );
  assert.equal(getZoneAt(pos.x, pos.z), 'zone.observation');
});

test('collision prevents walking through walls and glass barrier while allowing sliding', () => {
  // Try walking straight into the corridor west wall while moving forward (-Z)
  let pos = { x: -1.1, z: -6.0 };
  for (let i = 0; i < 60; i++) {
    pos = resolveMovement(pos, -0.08, -0.05, PLAYER_RADIUS, FACILITY_COLLIDERS);
  }
  assert.ok(
    pos.x >= -1.55 + PLAYER_RADIUS - 0.01,
    `Player penetrated west wall: x=${pos.x}`
  );
  assert.ok(
    pos.z < -7.5,
    `Player failed to slide along wall while moving forward: z=${pos.z}`
  );

  // Try walking through the observation glass at z = -21.0
  let glassPos = { x: 0, z: -18.8 };
  for (let i = 0; i < 100; i++) {
    glassPos = resolveMovement(glassPos, 0, -0.05, PLAYER_RADIUS, FACILITY_COLLIDERS);
  }
  // Should stop at main console (z = -19.25 + radius) or glass (z = -20.88 + radius)
  assert.ok(
    glassPos.z > -20.88,
    `Player walked through observation glass: z=${glassPos.z}`
  );
});

test('zone detection accurately classifies all four facility areas', () => {
  assert.equal(getZoneAt(0, 1.8), 'zone.awakening');
  assert.equal(getZoneAt(0, -8.0), 'zone.corridor');
  assert.equal(getZoneAt(0, -17.5), 'zone.observation');
  assert.equal(getZoneAt(6.0, -18.0), 'zone.memoryWing');
  assert.equal(getZoneAt(12.5, -18.0), 'zone.memoryWing');
});

test('interactable focus requires proximity and camera alignment across existing and Milestone 03 objects', () => {
  // Looking directly at terminal from z = -18.2
  const focused = findFocusedInteractable(0, 1.66, -18.2, 0, -0.25, -0.968);
  assert.ok(focused !== null);
  assert.equal(focused?.id, 'terminal');

  // Too far away (in corridor)
  const far = findFocusedInteractable(0, 1.66, -12.0, 0, 0, -1);
  assert.equal(far, null);

  // Looking away from terminal
  const away = findFocusedInteractable(0, 1.66, -18.2, 0, 0, 1);
  assert.equal(away, null);

  // Looking at archived record on left desk (-2.65, 0.92, -18.15) from (-1.4, 1.66, -18.15)
  const recordFocused = findFocusedInteractable(
    -1.4,
    1.66,
    -18.15,
    -0.85,
    -0.5,
    0
  );
  assert.ok(recordFocused !== null);
  assert.equal(recordFocused?.id, 'record');

  // Looking at access card stand (3.1, 0.88, -16.1) from (2.1, 1.66, -16.8)
  const cardDirX = 3.1 - 2.1;
  const cardDirY = 0.88 - 1.66;
  const cardDirZ = -16.1 - -16.8;
  const cardLen = Math.hypot(cardDirX, cardDirY, cardDirZ);
  const cardFocused = findFocusedInteractable(
    2.1,
    1.66,
    -16.8,
    cardDirX / cardLen,
    cardDirY / cardLen,
    cardDirZ / cardLen,
    undefined,
    { hasAccessCard: false }
  );
  assert.equal(cardFocused?.id, 'access_card');

  // Once collected, access_card cannot be focused again (nor an already-unlocked door)
  const cardAfter = findFocusedInteractable(
    2.1,
    1.66,
    -16.8,
    cardDirX / cardLen,
    cardDirY / cardLen,
    cardDirZ / cardLen,
    undefined,
    { hasAccessCard: true, doorUnlocked: true }
  );
  assert.equal(cardAfter, null);

  // Security door focusable when looking East at (4.16, 1.32, -18.0) while locked
  const doorFocused = findFocusedInteractable(
    2.6,
    1.66,
    -18.0,
    0.98,
    -0.18,
    0,
    undefined,
    { doorUnlocked: false }
  );
  assert.equal(doorFocused?.id, 'security_door');

  // Memory Analysis Console focusable from directly West (12.6, 1.66, -18.0) looking +X
  const consoleFocused = findFocusedInteractable(
    12.6,
    1.66,
    -18.0,
    0.97,
    -0.24,
    0
  );
  assert.equal(consoleFocused?.id, 'memory_console');
});

test('first mysterious sighting triggers once after terminal activation and completes cleanly', () => {
  let progress = createInitialStoryProgress();
  progress = markRecordInspected(progress);
  assert.equal(progress.recordInspected, true);

  // Should not trigger before terminal activation
  progress = triggerSightingIfReady(progress);
  assert.equal(progress.sightingStage, 'idle');

  // Activate terminal and trigger sighting on close
  progress = markTerminalActivated(progress);
  progress = triggerSightingIfReady(progress);
  assert.equal(progress.sightingStage, 'pending');

  // Step through pending -> appearing
  let res = stepSighting(progress, 0.5);
  progress = res.next;
  assert.equal(progress.sightingStage, 'appearing');
  assert.equal(res.visual.justStartedAppear, true);
  assert.equal(res.visual.silhouetteVisible, true);

  // Step through appearing -> visible
  res = stepSighting(progress, 0.3);
  progress = res.next;
  assert.equal(progress.sightingStage, 'visible');
  assert.equal(res.visual.silhouetteVisible, true);
  assert.equal(res.visual.silhouetteOpacity, 1);

  // Step through visible -> flicker (at ~0.05s into flicker dip)
  res = stepSighting(progress, 2.65);
  progress = res.next;
  assert.equal(progress.sightingStage, 'flicker');
  assert.equal(res.visual.justStartedFlicker, true);
  assert.equal(res.visual.silhouetteVisible, false);
  assert.ok(res.visual.lightFactor < 0.5);

  // Step through flicker -> completed
  res = stepSighting(progress, 0.3);
  progress = res.next;
  assert.equal(progress.sightingStage, 'completed');
  assert.equal(res.visual.justCompleted, true);
  assert.equal(res.visual.lightFactor, 1);

  // Re-triggering after completion is a no-op
  const afterRetrigger = triggerSightingIfReady(progress);
  assert.equal(afterRetrigger.sightingStage, 'completed');
});

test('objectives advance strictly in sequence without premature completion or duplicate notifications', () => {
  let story = createInitialStoryProgress();
  let objState = createInitialObjectiveState();

  assert.equal(getCurrentObjectiveDef(objState)?.id, 'obj_corridor');

  // Step 1: Enter Research Corridor
  story = markZoneVisited(story, 'zone.corridor');
  let res = reconcileObjectives(objState, toObjectiveFacts(story));
  objState = res.next;
  assert.deepEqual(res.newlyCompleted, ['obj_corridor']);
  assert.equal(getCurrentObjectiveDef(objState)?.id, 'obj_observation');

  // Repeated reconciliation does not re-notify obj_corridor
  res = reconcileObjectives(objState, toObjectiveFacts(story));
  assert.deepEqual(res.newlyCompleted, []);

  // Step 2: Enter Observation Room
  story = markZoneVisited(story, 'zone.observation');
  res = reconcileObjectives(objState, toObjectiveFacts(story));
  objState = res.next;
  assert.deepEqual(res.newlyCompleted, ['obj_observation']);
  assert.equal(getCurrentObjectiveDef(objState)?.id, 'obj_terminal');

  // Entering Observation Room alone must NOT complete terminal objective
  res = reconcileObjectives(objState, toObjectiveFacts(story));
  assert.equal(getCurrentObjectiveDef(objState)?.id, 'obj_terminal');
  assert.deepEqual(res.newlyCompleted, []);

  // Step 3: Activate Terminal -> Step 4: Inspect Record -> Step 5: Collect Card
  story = markTerminalActivated(story);
  res = reconcileObjectives(objState, toObjectiveFacts(story));
  objState = res.next;
  assert.deepEqual(res.newlyCompleted, ['obj_terminal']);
  assert.equal(getCurrentObjectiveDef(objState)?.id, 'obj_record');

  story = markRecordInspected(story);
  res = reconcileObjectives(objState, toObjectiveFacts(story));
  objState = res.next;
  assert.deepEqual(res.newlyCompleted, ['obj_record']);
  assert.equal(getCurrentObjectiveDef(objState)?.id, 'obj_access_card');

  story = markAccessCardCollected(story);
  res = reconcileObjectives(objState, toObjectiveFacts(story));
  objState = res.next;
  assert.deepEqual(res.newlyCompleted, ['obj_access_card']);
  assert.equal(getCurrentObjectiveDef(objState)?.id, 'obj_enter_wing');

  // Unlocking door alone does not complete Step 6 until entering Memory Wing
  const unlock = tryUnlockSecurityDoor(story);
  assert.equal(unlock.granted, true);
  story = unlock.next;
  res = reconcileObjectives(objState, toObjectiveFacts(story));
  objState = res.next;
  assert.equal(getCurrentObjectiveDef(objState)?.id, 'obj_enter_wing');

  story = markZoneVisited(story, 'zone.memoryWing');
  res = reconcileObjectives(objState, toObjectiveFacts(story));
  objState = res.next;
  assert.deepEqual(res.newlyCompleted, ['obj_enter_wing']);
  assert.equal(getCurrentObjectiveDef(objState)?.id, 'obj_analysis_console');

  // Step 7: Inspect Memory Analysis Console -> unlocks Step 8 (First Recall)
  story = markAnalysisConsoleInspected(story);
  res = reconcileObjectives(objState, toObjectiveFacts(story));
  objState = res.next;
  assert.deepEqual(res.newlyCompleted, ['obj_analysis_console']);
  assert.equal(getCurrentObjectiveDef(objState)?.id, 'obj_first_recall');

  // Step 8: Complete Memory Fragment 01 -> unlocks Step 9 (Review Reconstruction Findings)
  story = markMemoryFragmentCompleted(story);
  res = reconcileObjectives(objState, toObjectiveFacts(story));
  objState = res.next;
  assert.deepEqual(res.newlyCompleted, ['obj_first_recall']);
  assert.equal(getCurrentObjectiveDef(objState)?.id, 'obj_post_memory');

  // Step 9: Review post-memory findings -> completes all Milestone 04 objectives
  story = markPostMemoryReviewed(story);
  res = reconcileObjectives(objState, toObjectiveFacts(story));
  objState = res.next;
  assert.deepEqual(res.newlyCompleted, ['obj_post_memory']);
  assert.equal(objState.completedIds.length, OBJECTIVE_DEFS.length);
  assert.equal(getCurrentObjectiveDef(objState), null);
});

test('evidence collection deduplicates entries and stores stable locale-independent IDs', () => {
  let ev = createInitialEvidenceState();
  assert.equal(ev.discoveredIds.length, 0);

  for (const def of EVIDENCE_DEFS) {
    const first = collectEvidence(ev, def.id);
    assert.equal(first.added, true);
    ev = first.next;
    assert.equal(isEvidenceDiscovered(ev, def.id), true);

    const duplicate = collectEvidence(ev, def.id);
    assert.equal(duplicate.added, false);
    assert.equal(duplicate.next.discoveredIds.length, ev.discoveredIds.length);
  }

  assert.equal(ev.discoveredIds.length, EVIDENCE_DEFS.length);
});

test('security door denies entry without access card and opens unobstructed passage into Memory Analysis Wing when unlocked', () => {
  let story = createInitialStoryProgress();
  assert.equal(story.hasAccessCard, false);
  assert.equal(story.doorUnlocked, false);

  // Locked door blocks passage from Observation Room (0, -18.0) walking East (+X)
  let lockedPos = { x: 2.5, z: -18.0 };
  for (let i = 0; i < 80; i++) {
    lockedPos = resolveMovement(
      lockedPos,
      0.05,
      0,
      PLAYER_RADIUS,
      getActiveColliders(story.doorOpenProgress)
    );
  }
  assert.ok(
    lockedPos.x < 4.02,
    `Locked security bulkhead must block player before x=4.02, got x=${lockedPos.x}`
  );

  // Attempting to unlock without card is denied
  const denied = tryUnlockSecurityDoor(story);
  assert.equal(denied.granted, false);
  assert.equal(denied.next.doorUnlocked, false);

  // Collecting card unlocks the door and allows animation to open past clearance threshold
  story = markAccessCardCollected(story);
  const granted = tryUnlockSecurityDoor(story);
  assert.equal(granted.granted, true);
  assert.equal(granted.next.doorUnlocked, true);
  story = granted.next;

  story = stepSecurityDoor(story, DOOR_OPEN_DURATION + 0.1);
  assert.equal(story.doorOpenProgress, 1);

  // Player walks straight East from Observation Room into Memory Analysis Lab up to Central Console
  let wingPos = { x: 2.5, z: -18.0 };
  for (let i = 0; i < 240; i++) {
    wingPos = resolveMovement(
      wingPos,
      0.05,
      0,
      PLAYER_RADIUS,
      getActiveColliders(story.doorOpenProgress)
    );
  }

  assert.ok(
    wingPos.x > 12.5 && wingPos.x < 13.45,
    `Expected player to cross vestibule and stop right in front of Memory Console (~13.09), got x=${wingPos.x}`
  );
  assert.equal(getZoneAt(wingPos.x, wingPos.z), 'zone.memoryWing');
});

test('memory reconstruction initializes in Immersion Mode with exact facility pose snapshot preserved', () => {
  const snapshot = {
    playerX: 12.8,
    playerZ: -18.0,
    yaw: -1.55,
    pitch: -0.18,
    flashlightOn: false,
  };
  const session = createMemorySession('memory_fragment_01', snapshot);
  assert.equal(session.fragmentId, 'memory_fragment_01');
  assert.equal(session.stage, 'immersion');
  assert.equal(session.mode, 'immersion');
  assert.equal(session.discoveredAnomalies.length, 0);
  assert.deepEqual(session.facilitySnapshot, snapshot);
});

test('apartment layout is continuously navigable across Entrance Hall, Living Room, and Study', () => {
  let pos = {
    x: MEMORY_FRAGMENT_01_DEF.spawn.x,
    z: MEMORY_FRAGMENT_01_DEF.spawn.z,
  };
  assert.equal(getMemoryZoneAt(pos.x, pos.z), 'memory.zone.entrance');

  // Walk North (-Z) from spawn (0, 0.85) straight through the Entrance Hall archway into Living Room
  for (let i = 0; i < 80; i++) {
    pos = resolveMovement(
      pos,
      0,
      -0.05,
      PLAYER_RADIUS,
      MEMORY_FRAGMENT_01_DEF.colliders
    );
  }
  assert.ok(pos.z < -2.2, `Expected to pass through archway past z=-2.2, got z=${pos.z}`);
  assert.equal(getMemoryZoneAt(pos.x, pos.z), 'memory.zone.living');

  // Walk East (+X) past sofa then North (-Z) to Study doorway corridor (z ~ -5.3)
  for (let i = 0; i < 36; i++) {
    pos = resolveMovement(
      pos,
      0.05,
      0,
      PLAYER_RADIUS,
      MEMORY_FRAGMENT_01_DEF.colliders
    );
  }
  for (let i = 0; i < 50; i++) {
    pos = resolveMovement(
      pos,
      0,
      -0.05,
      PLAYER_RADIUS,
      MEMORY_FRAGMENT_01_DEF.colliders
    );
  }
  for (let i = 0; i < 70; i++) {
    pos = resolveMovement(
      pos,
      0.05,
      0,
      PLAYER_RADIUS,
      MEMORY_FRAGMENT_01_DEF.colliders
    );
  }
  assert.ok(
    pos.x > 4.2 && pos.x < 5.5,
    `Expected unobstructed path into Small Study, reached x=${pos.x}, z=${pos.z}`
  );
  assert.equal(getMemoryZoneAt(pos.x, pos.z), 'memory.zone.study');

  // Focus check on Study interior door from (5.15, 1.66, -6.2) looking North (-Z)
  const doorFocus = findFocusedMemoryInteractable(
    5.15,
    1.66,
    -6.2,
    0,
    -0.28,
    -0.96
  );
  assert.equal(doorFocus?.id, 'interior_door');
});

test('memory anomalies support discovery in any order, deduplicate cleanly, and gate Observer Mode & Collapse', () => {
  const baseSnap = {
    playerX: 12.8,
    playerZ: -18.0,
    yaw: 0,
    pitch: 0,
    flashlightOn: true,
  };
  let mem = createMemorySession('memory_fragment_01', baseSnap);

  // Order 1: Phone -> Clock (x2) -> Photo (inspect + look/step away + inspect)
  let out = interactInMemory(mem, 'phone');
  mem = out.nextState;
  assert.equal(out.recordedNewAnomaly, true);
  assert.equal(mem.discoveredAnomalies.length, 1);
  assert.equal(mem.mode, 'immersion');

  // Interacting with phone again never duplicates anomaly
  out = interactInMemory(mem, 'phone');
  mem = out.nextState;
  assert.equal(out.recordedNewAnomaly, false);
  assert.equal(mem.discoveredAnomalies.length, 1);

  // Interior door is locked/ordinary before Observer Mode cycle discrepancy
  out = interactInMemory(mem, 'interior_door');
  mem = out.nextState;
  assert.equal(out.triggeredCollapse, false);
  assert.equal(mem.stage, 'immersion');

  // Clock first examine -> notes frozen 11:42, does not record yet
  out = interactInMemory(mem, 'clock');
  mem = out.nextState;
  assert.equal(mem.clockInspectedOnce, true);
  assert.equal(out.recordedNewAnomaly, false);

  // Clock re-examine -> records anomaly 01 (frozen_clock)
  out = interactInMemory(mem, 'clock');
  mem = out.nextState;
  assert.equal(out.recordedNewAnomaly, true);
  assert.equal(mem.discoveredAnomalies.length, 2);
  assert.equal(mem.mode, 'immersion');

  // Photo first examine -> ordinary, then step/look away, then examine altered photo
  out = interactInMemory(mem, 'photo');
  mem = out.nextState;
  assert.equal(mem.photoInspectedOnce, true);
  assert.equal(mem.photoChanged, false);

  // Still standing close looking directly at photo does NOT trigger alteration
  mem = updatePhotoAwayState(mem, -2.2, -4.75, -1, 0);
  assert.equal(mem.photoChanged, false);

  // Looking away or moving across Living Room triggers photograph alteration
  mem = updatePhotoAwayState(mem, 0.2, -5.0, 1, 0);
  assert.equal(mem.photoChanged, true);

  // Inspecting changed photo records final (3rd) anomaly and initiates Observer Mode transition
  out = interactInMemory(mem, 'photo');
  mem = out.nextState;
  assert.equal(out.recordedNewAnomaly, true);
  assert.equal(out.enteredObserverTransition, true);
  assert.equal(mem.discoveredAnomalies.length, 3);
  assert.equal(mem.stage, 'observer_transition');

  // Step transition -> Observer Mode active, cycle 1 starts (discrepancy NOT ready yet)
  let stepRes = stepMemorySimulation(mem, OBSERVER_TRANSITION_DURATION + 0.05);
  mem = stepRes.next;
  assert.equal(stepRes.justEnteredObserver, true);
  assert.equal(mem.mode, 'observer');
  assert.equal(mem.echoCycleCount, 1);
  assert.equal(mem.discrepancyInteractableReady, false);

  // Step through Echo Cycle 1 -> Cycle 2+ reveals detail shift & Study door discrepancy
  stepRes = stepMemorySimulation(mem, ECHO_CYCLE_DURATION + 0.1);
  mem = stepRes.next;
  assert.equal(stepRes.justChangedEchoDetail, true);
  assert.equal(mem.echoChangedDetail, true);
  assert.equal(mem.discrepancyInteractableReady, true);

  // Interacting with fractured Study interior door now triggers Memory Collapse
  out = interactInMemory(mem, 'interior_door');
  mem = out.nextState;
  assert.equal(out.triggeredCollapse, true);
  assert.equal(out.subtitleKey, 'memory.msg.collapseSubtitle');
  assert.equal(mem.stage, 'collapse');

  // Step through collapse countdown until ready to fade back to facility
  stepRes = stepMemorySimulation(mem, MEMORY_COLLAPSE_DURATION + 0.1);
  mem = stepRes.next;
  assert.equal(stepRes.justCompletedCollapse, true);
  assert.equal(mem.readyToExit, true);

  // Direct order invariance test: Photo -> Phone -> Clock still transitions cleanly
  let reverseMem = createMemorySession('memory_fragment_01', baseSnap);
  reverseMem = interactInMemory(reverseMem, 'photo').nextState;
  reverseMem = updatePhotoAwayState(reverseMem, 0.5, -5.0, 1, 0);
  reverseMem = interactInMemory(reverseMem, 'photo').nextState;
  reverseMem = interactInMemory(reverseMem, 'phone').nextState;
  reverseMem = interactInMemory(reverseMem, 'clock').nextState;
  const finalOut = interactInMemory(reverseMem, 'clock');
  assert.equal(finalOut.enteredObserverTransition, true);
  assert.equal(finalOut.nextState.discoveredAnomalies.length, 3);
  assert.equal(discoverMemoryAnomaly(finalOut.nextState, 'frozen_clock').added, false);
});

test('returning from memory fragment restores facility progress and deduplicates journal entry on revisit', () => {
  let ev = createInitialEvidenceState();
  const first = collectEvidence(ev, 'memory_fragment_01');
  assert.equal(first.added, true);
  ev = first.next;

  // Revisiting Fragment 01 must NOT duplicate memory_fragment_01 journal entry
  const revisit = collectEvidence(ev, 'memory_fragment_01');
  assert.equal(revisit.added, false);
  assert.equal(revisit.next.discoveredIds.filter((id) => id === 'memory_fragment_01').length, 1);

  // All facility progress flags remain intact alongside memory completion
  let story = createInitialStoryProgress();
  story = markTerminalActivated(story);
  story = markRecordInspected(story);
  story = markAccessCardCollected(story);
  story = markAnalysisConsoleInspected(story);
  story = markMemoryFragmentCompleted(story);
  assert.equal(story.terminalActivated, true);
  assert.equal(story.hasAccessCard, true);
  assert.equal(story.memoryFragmentCompleted, true);
});


