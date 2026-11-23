import * as THREE from 'three';
import { FacilityTextures } from './textures';

export interface PropMaterials {
  steelDark: THREE.MeshStandardMaterial;
  steelBrushed: THREE.MeshStandardMaterial;
  polymerMatte: THREE.MeshStandardMaterial;
  mattressWhite: THREE.MeshStandardMaterial;
  screenGlow: THREE.MeshStandardMaterial;
  eegScreenGlow: THREE.MeshStandardMaterial;
  dossierPaper: THREE.MeshStandardMaterial;
  accessCardMat: THREE.MeshStandardMaterial;
  doorPlaqueMat: THREE.MeshStandardMaterial;
  memoryConsoleScreenMat: THREE.MeshStandardMaterial;
  neuralScanScreenMat: THREE.MeshStandardMaterial;
  sessionReportPaperMat: THREE.MeshStandardMaterial;
  redBeacon: THREE.MeshStandardMaterial;
  greenBeacon: THREE.MeshStandardMaterial;
  blueStrip: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
  silhouette: THREE.MeshStandardMaterial;
  dispose: () => void;
}

export function createPropMaterials(textures: FacilityTextures): PropMaterials {
  const steelDark = new THREE.MeshStandardMaterial({
    color: 0x26313d,
    roughness: 0.42,
    metalness: 0.72,
  });
  const steelBrushed = new THREE.MeshStandardMaterial({
    color: 0x5c6d7e,
    roughness: 0.28,
    metalness: 0.85,
  });
  const polymerMatte = new THREE.MeshStandardMaterial({
    color: 0x1c242c,
    roughness: 0.82,
    metalness: 0.08,
  });
  const mattressWhite = new THREE.MeshStandardMaterial({
    color: 0x9aa9b8,
    roughness: 0.9,
    metalness: 0.02,
  });
  const screenGlow = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.terminalScreenMap,
    emissive: 0x38bdf8,
    emissiveMap: textures.terminalScreenMap,
    emissiveIntensity: 0.85,
    roughness: 0.72,
    metalness: 0.04,
  });
  const eegScreenGlow = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.eegScreenMap,
    emissive: 0x38bdf8,
    emissiveMap: textures.eegScreenMap,
    emissiveIntensity: 0.7,
    roughness: 0.72,
    metalness: 0.04,
  });
  const dossierPaper = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.dossierPaperMap,
    emissive: 0x1e293b,
    emissiveIntensity: 0.25,
    roughness: 0.88,
    metalness: 0.02,
  });
  const accessCardMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.accessCardMap,
    emissive: 0x38bdf8,
    emissiveMap: textures.accessCardMap,
    emissiveIntensity: 0.45,
    roughness: 0.3,
    metalness: 0.15,
  });
  const doorPlaqueMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.doorPlaqueLockedMap,
    emissive: 0xffffff,
    emissiveMap: textures.doorPlaqueLockedMap,
    emissiveIntensity: 0.55,
    roughness: 0.4,
    metalness: 0.1,
  });
  const memoryConsoleScreenMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.memoryConsoleMap,
    emissive: 0x38bdf8,
    emissiveMap: textures.memoryConsoleMap,
    emissiveIntensity: 0.9,
    roughness: 0.65,
    metalness: 0.05,
  });
  const neuralScanScreenMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.neuralScanMap,
    emissive: 0x38bdf8,
    emissiveMap: textures.neuralScanMap,
    emissiveIntensity: 0.75,
    roughness: 0.68,
    metalness: 0.05,
  });
  const sessionReportPaperMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.sessionReportMap,
    emissive: 0x1e293b,
    emissiveIntensity: 0.22,
    roughness: 0.86,
    metalness: 0.02,
  });
  const redBeacon = new THREE.MeshStandardMaterial({
    color: 0x7f1d1d,
    emissive: 0xef4444,
    emissiveIntensity: 1.4,
    roughness: 0.3,
    metalness: 0.2,
  });
  const greenBeacon = new THREE.MeshStandardMaterial({
    color: 0x065f46,
    emissive: 0x34d399,
    emissiveIntensity: 1.35,
    roughness: 0.3,
    metalness: 0.2,
  });
  const blueStrip = new THREE.MeshStandardMaterial({
    color: 0xcbe6f8,
    emissive: 0x9bd2f5,
    emissiveIntensity: 1.15,
    roughness: 0.2,
    metalness: 0.1,
  });
  const contactShadow = new THREE.MeshBasicMaterial({
    map: textures.contactShadowMap,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const silhouette = new THREE.MeshStandardMaterial({
    color: 0x05080c,
    roughness: 0.92,
    metalness: 0.04,
    transparent: true,
    opacity: 0,
  });

  return {
    steelDark,
    steelBrushed,
    polymerMatte,
    mattressWhite,
    screenGlow,
    eegScreenGlow,
    dossierPaper,
    accessCardMat,
    doorPlaqueMat,
    memoryConsoleScreenMat,
    neuralScanScreenMat,
    sessionReportPaperMat,
    redBeacon,
    greenBeacon,
    blueStrip,
    contactShadow,
    silhouette,
    dispose: () => {
      steelDark.dispose();
      steelBrushed.dispose();
      polymerMatte.dispose();
      mattressWhite.dispose();
      screenGlow.dispose();
      eegScreenGlow.dispose();
      dossierPaper.dispose();
      accessCardMat.dispose();
      doorPlaqueMat.dispose();
      memoryConsoleScreenMat.dispose();
      neuralScanScreenMat.dispose();
      sessionReportPaperMat.dispose();
      redBeacon.dispose();
      greenBeacon.dispose();
      blueStrip.dispose();
      contactShadow.dispose();
      silhouette.dispose();
    },
  };
}

function addContactShadow(
  group: THREE.Group,
  mats: PropMaterials,
  radiusX: number,
  radiusZ: number
): void {
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1, 20),
    mats.contactShadow
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.015;
  disc.scale.set(radiusX, radiusZ, 1);
  group.add(disc);
}

/**
 * Composite Medical Examination Bed (Awakening Chamber)
 * Pivot: bottom-center (y = 0).
 */
export function createMedicalBed(mats: PropMaterials): THREE.Group {
  const g = new THREE.Group();
  addContactShadow(g, mats, 0.95, 1.35);

  // 4 steel support legs + base crossbars
  const legGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.52, 10);
  const legOffsets = [
    [-0.45, -0.82],
    [0.45, -0.82],
    [-0.45, 0.82],
    [0.45, 0.82],
  ];
  for (const [lx, lz] of legOffsets) {
    const leg = new THREE.Mesh(legGeo, mats.steelBrushed);
    leg.position.set(lx, 0.26, lz);
    g.add(leg);
  }

  // Chassis frame
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.06, 0.12, 2.02),
    mats.steelDark
  );
  chassis.position.y = 0.54;
  g.add(chassis);

  // Mattress
  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(0.98, 0.14, 1.92),
    mats.mattressWhite
  );
  mattress.position.y = 0.67;
  g.add(mattress);

  // Tilted headrest & pillow
  const pillow = new THREE.Mesh(
    new THREE.BoxGeometry(0.66, 0.09, 0.36),
    mats.mattressWhite
  );
  pillow.position.set(0, 0.77, 0.68);
  pillow.rotation.x = 0.12;
  g.add(pillow);

  // Side safety rails
  const railGeo = new THREE.BoxGeometry(0.035, 0.14, 1.15);
  const leftRail = new THREE.Mesh(railGeo, mats.steelBrushed);
  leftRail.position.set(-0.54, 0.78, 0);
  const rightRail = new THREE.Mesh(railGeo, mats.steelBrushed);
  rightRail.position.set(0.54, 0.78, 0);
  g.add(leftRail, rightRail);

  // Sensor overhead arc / IV pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 1.35, 8),
    mats.steelBrushed
  );
  pole.position.set(-0.5, 1.25, 0.88);
  g.add(pole);

  return g;
}

/**
 * Bio-telemetry Cart (Awakening Chamber)
 */
export function createTelemetryCart(mats: PropMaterials): THREE.Group {
  const g = new THREE.Group();
  addContactShadow(g, mats, 0.52, 0.52);

  // Pedestal base + 4 casters
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.08, 0.62),
    mats.steelDark
  );
  base.position.y = 0.08;
  g.add(base);

  // Vertical column
  const col = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 1.05, 0.18),
    mats.steelBrushed
  );
  col.position.set(0, 0.62, -0.1);
  g.add(col);

  // Console shelf
  const shelf = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.06, 0.54),
    mats.polymerMatte
  );
  shelf.position.y = 0.96;
  g.add(shelf);

  // Monitor housing + screen
  const housing = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.38, 0.12),
    mats.steelDark
  );
  housing.position.set(0, 1.24, -0.05);
  housing.rotation.x = -0.15;
  g.add(housing);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.3),
    mats.eegScreenGlow
  );
  screen.position.set(0, 1.24, 0.015);
  screen.rotation.x = -0.15;
  g.add(screen);

  // Subtle status LED
  const led = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.02, 0.02),
    mats.redBeacon
  );
  led.position.set(0.22, 1.09, 0.015);
  g.add(led);

  return g;
}

/**
 * Wall Medical Cabinet (Awakening Chamber)
 */
export function createWallCabinet(mats: PropMaterials): THREE.Group {
  const g = new THREE.Group();
  addContactShadow(g, mats, 0.45, 0.95);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 1.85, 1.4),
    mats.steelDark
  );
  body.position.y = 0.925;
  g.add(body);

  // Upper inset doors
  const doorGeo = new THREE.BoxGeometry(0.04, 0.92, 0.62);
  const doorL = new THREE.Mesh(doorGeo, mats.steelBrushed);
  doorL.position.set(-0.29, 1.32, -0.33);
  const doorR = new THREE.Mesh(doorGeo, mats.steelBrushed);
  doorR.position.set(-0.29, 1.32, 0.33);
  g.add(doorL, doorR);

  // Lower drawer faces
  for (let i = 0; i < 3; i++) {
    const drawer = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.22, 1.26),
      mats.polymerMatte
    );
    drawer.position.set(-0.29, 0.24 + i * 0.26, 0);
    g.add(drawer);
  }

  return g;
}

/**
 * Heavy Bulkhead Doorway Frame (Awakening->Corridor & Corridor->Observation)
 */
export function createDoorBulkhead(mats: PropMaterials): THREE.Group {
  const g = new THREE.Group();

  // Left & right thick jambs (clear opening = 2.1m wide, x: -1.05..+1.05)
  const jambGeo = new THREE.BoxGeometry(0.24, 2.55, 0.42);
  const leftJamb = new THREE.Mesh(jambGeo, mats.steelDark);
  leftJamb.position.set(-1.12, 1.275, 0);
  const rightJamb = new THREE.Mesh(jambGeo, mats.steelDark);
  rightJamb.position.set(1.12, 1.275, 0);
  g.add(leftJamb, rightJamb);

  // Header lintel
  const header = new THREE.Mesh(
    new THREE.BoxGeometry(2.48, 0.28, 0.44),
    mats.steelDark
  );
  header.position.set(0, 2.54, 0);
  g.add(header);

  // Floor threshold plate (raised 0.02m to prevent Z-fighting)
  const threshold = new THREE.Mesh(
    new THREE.BoxGeometry(2.14, 0.025, 0.38),
    mats.steelBrushed
  );
  threshold.position.set(0, 0.0125, 0);
  g.add(threshold);

  // Keypad panel + red beacon on right jamb
  const keypad = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.24, 0.14),
    mats.polymerMatte
  );
  keypad.position.set(1.26, 1.32, 0.22);
  g.add(keypad);

  const beacon = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.07, 0.1),
    mats.redBeacon
  );
  beacon.position.set(0, 2.74, 0.22);
  g.add(beacon);

  return g;
}

/**
 * Industrial Corridor Structural Rib + Overhead Light Fixture
 */
export function createCorridorRib(
  mats: PropMaterials,
  hasLightStrip: boolean
): THREE.Group {
  const g = new THREE.Group();

  const colGeo = new THREE.BoxGeometry(0.24, 3.15, 0.26);
  const leftCol = new THREE.Mesh(colGeo, mats.steelDark);
  leftCol.position.set(-1.48, 1.575, 0);
  const rightCol = new THREE.Mesh(colGeo, mats.steelDark);
  rightCol.position.set(1.48, 1.575, 0);
  g.add(leftCol, rightCol);

  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.24, 0.28),
    mats.steelDark
  );
  beam.position.set(0, 3.04, 0);
  g.add(beam);

  if (hasLightStrip) {
    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.06, 0.16),
      mats.polymerMatte
    );
    housing.position.set(0, 2.91, 0);
    g.add(housing);

    const diffuser = new THREE.Mesh(
      new THREE.BoxGeometry(0.96, 0.03, 0.1),
      mats.blueStrip
    );
    diffuser.position.set(0, 2.88, 0);
    g.add(diffuser);
  }

  return g;
}

/**
 * Observation Room Main Control Console + Research Terminal
 */
export function createObservationConsole(mats: PropMaterials): THREE.Group {
  const g = new THREE.Group();
  addContactShadow(g, mats, 1.6, 0.65);

  // Desk pedestal legs
  const legGeo = new THREE.BoxGeometry(0.16, 0.76, 0.85);
  const leftLeg = new THREE.Mesh(legGeo, mats.steelDark);
  leftLeg.position.set(-1.32, 0.38, 0);
  const rightLeg = new THREE.Mesh(legGeo, mats.steelDark);
  rightLeg.position.set(1.32, 0.38, 0);
  const centerModesty = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.66, 0.08),
    mats.polymerMatte
  );
  centerModesty.position.set(0, 0.38, -0.32);
  g.add(leftLeg, rightLeg, centerModesty);

  // Tabletop surface
  const deskTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.96, 0.06, 0.96),
    mats.steelDark
  );
  deskTop.position.set(0, 0.79, 0);
  g.add(deskTop);

  // Keyboard deck
  const keyboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.025, 0.2),
    mats.polymerMatte
  );
  keyboard.position.set(0, 0.835, 0.24);
  keyboard.rotation.x = 0.06;
  g.add(keyboard);

  // Primary Research Terminal Monitor (Center)
  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.28, 0.12),
    mats.steelBrushed
  );
  stand.position.set(0, 0.94, -0.12);
  g.add(stand);

  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.56, 0.08),
    mats.polymerMatte
  );
  bezel.position.set(0, 1.24, -0.06);
  bezel.rotation.x = -0.08;
  g.add(bezel);

  const terminalScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.84, 0.48),
    mats.screenGlow
  );
  terminalScreen.position.set(0, 1.24, -0.015);
  terminalScreen.rotation.x = -0.08;
  g.add(terminalScreen);

  // Flanking Auxiliary Monitors (Left & Right)
  const sideBezelGeo = new THREE.BoxGeometry(0.62, 0.4, 0.07);
  const sideScreenGeo = new THREE.PlaneGeometry(0.54, 0.32);

  const leftMonitor = new THREE.Group();
  leftMonitor.position.set(-0.92, 1.14, -0.02);
  leftMonitor.rotation.y = 0.24;
  leftMonitor.add(new THREE.Mesh(sideBezelGeo, mats.polymerMatte));
  const lScr = new THREE.Mesh(sideScreenGeo, mats.eegScreenGlow);
  lScr.position.z = 0.038;
  leftMonitor.add(lScr);

  const rightMonitor = new THREE.Group();
  rightMonitor.position.set(0.92, 1.14, -0.02);
  rightMonitor.rotation.y = -0.24;
  rightMonitor.add(new THREE.Mesh(sideBezelGeo, mats.polymerMatte));
  const rScr = new THREE.Mesh(sideScreenGeo, mats.eegScreenGlow);
  rScr.position.z = 0.038;
  rightMonitor.add(rScr);

  g.add(leftMonitor, rightMonitor);

  return g;
}

/**
 * Archived Research Record Desk (Observation Room Left)
 */
export function createRecordDesk(mats: PropMaterials): THREE.Group {
  const g = new THREE.Group();
  addContactShadow(g, mats, 0.85, 0.55);

  // 4 steel legs
  const legGeo = new THREE.BoxGeometry(0.06, 0.75, 0.06);
  for (const [lx, lz] of [
    [-0.64, -0.38],
    [0.64, -0.38],
    [-0.64, 0.38],
    [0.64, 0.38],
  ]) {
    const leg = new THREE.Mesh(legGeo, mats.steelBrushed);
    leg.position.set(lx, 0.375, lz);
    g.add(leg);
  }

  // Tabletop
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 0.05, 0.88),
    mats.steelDark
  );
  top.position.y = 0.775;
  g.add(top);

  // Interactable Dossier Folder (SUBJECT 012)
  const folderBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.015, 0.42),
    mats.polymerMatte
  );
  folderBack.position.set(0.08, 0.808, 0.05);
  folderBack.rotation.y = 0.14;
  g.add(folderBack);

  const dossierSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.36),
    mats.dossierPaper
  );
  dossierSheet.rotation.x = -Math.PI / 2;
  dossierSheet.rotation.z = 0.14;
  dossierSheet.position.set(0.08, 0.818, 0.05);
  g.add(dossierSheet);

  // Small Desk Lamp highlighting the record
  const lampBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 0.03, 12),
    mats.steelBrushed
  );
  lampBase.position.set(-0.42, 0.815, -0.2);
  const lampStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.38, 8),
    mats.steelBrushed
  );
  lampStem.position.set(-0.42, 1.0, -0.2);
  const lampHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.06, 0.1),
    mats.steelDark
  );
  lampHead.position.set(-0.34, 1.18, -0.15);
  lampHead.rotation.z = -0.35;
  const lampGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.14, 0.07),
    mats.blueStrip
  );
  lampGlow.rotation.x = Math.PI / 2;
  lampGlow.position.set(-0.34, 1.148, -0.15);
  g.add(lampBase, lampStem, lampHead, lampGlow);

  return g;
}

/**
 * Telemetry / Server Rack (Observation Room Right)
 */
export function createServerRack(mats: PropMaterials): THREE.Group {
  const g = new THREE.Group();
  addContactShadow(g, mats, 0.58, 0.72);

  const cabinet = new THREE.Mesh(
    new THREE.BoxGeometry(0.88, 2.2, 1.15),
    mats.polymerMatte
  );
  cabinet.position.y = 1.1;
  g.add(cabinet);

  // Rack face modules
  for (let i = 0; i < 6; i++) {
    const unit = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.24, 0.96),
      mats.steelDark
    );
    unit.position.set(-0.44, 0.32 + i * 0.31, 0);
    g.add(unit);

    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.025, 0.06),
      i % 2 === 0 ? mats.blueStrip : mats.redBeacon
    );
    led.position.set(-0.465, 0.34 + i * 0.31, 0.36);
    g.add(led);
  }

  return g;
}

/**
 * Test Bay Observation Rig (Beyond Glass Window)
 */
export function createTestChamberRig(mats: PropMaterials): THREE.Group {
  const g = new THREE.Group();

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.65, 0.14, 24),
    mats.steelDark
  );
  plinth.position.y = 0.07;
  g.add(plinth);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.52, 0.03, 8, 28),
    mats.steelBrushed
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.14;
  g.add(ring);

  // Examination chair in center of test chamber
  const chairBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.32, 0.42, 12),
    mats.steelBrushed
  );
  chairBase.position.y = 0.35;
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.1, 0.54),
    mats.polymerMatte
  );
  seat.position.y = 0.58;
  const backrest = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.72, 0.1),
    mats.polymerMatte
  );
  backrest.position.set(0, 0.96, -0.22);
  backrest.rotation.x = -0.12;
  g.add(chairBase, seat, backrest);

  return g;
}

/**
 * Composite Human Silhouette for the First Mysterious Sighting
 * Positioned behind observation glass, deliberately shadowed & indistinct.
 */
export function createHumanSilhouette(mats: PropMaterials): THREE.Group {
  const g = new THREE.Group();

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.88, 10);
  const leftLeg = new THREE.Mesh(legGeo, mats.silhouette);
  leftLeg.position.set(-0.11, 0.44, 0);
  const rightLeg = new THREE.Mesh(legGeo, mats.silhouette);
  rightLeg.position.set(0.11, 0.44, 0);
  g.add(leftLeg, rightLeg);

  // Torso
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.21, 0.17, 0.64, 12),
    mats.silhouette
  );
  torso.position.y = 1.2;
  torso.scale.set(1.15, 1, 0.68);
  g.add(torso);

  // Shoulders
  const shoulders = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 8),
    mats.silhouette
  );
  shoulders.position.y = 1.48;
  shoulders.scale.set(1.22, 0.45, 0.7);
  g.add(shoulders);

  // Neck + Head
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.065, 0.12, 8),
    mats.silhouette
  );
  neck.position.y = 1.56;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.115, 12, 10),
    mats.silhouette
  );
  head.position.y = 1.71;
  head.scale.set(0.88, 1.08, 0.94);
  g.add(neck, head);

  // Arms hanging motionless at sides
  const armGeo = new THREE.CylinderGeometry(0.052, 0.044, 0.62, 8);
  const leftArm = new THREE.Mesh(armGeo, mats.silhouette);
  leftArm.position.set(-0.26, 1.18, 0);
  leftArm.rotation.z = 0.06;
  const rightArm = new THREE.Mesh(armGeo, mats.silhouette);
  rightArm.position.set(0.26, 1.18, 0);
  rightArm.rotation.z = -0.06;
  g.add(leftArm, rightArm);

  return g;
}

/**
 * Security Stand + Collectible Access Card (Observation Room SE Corner)
 */
export function createAccessCardStand(mats: PropMaterials): {
  group: THREE.Group;
  cardGroup: THREE.Group;
} {
  const g = new THREE.Group();
  addContactShadow(g, mats, 0.58, 0.58);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.06, 0.78),
    mats.steelBrushed
  );
  base.position.y = 0.03;
  g.add(base);

  const legGeo = new THREE.BoxGeometry(0.06, 0.74, 0.06);
  for (const [lx, lz] of [
    [-0.4, -0.32],
    [0.4, -0.32],
    [-0.4, 0.32],
    [0.4, 0.32],
  ]) {
    const leg = new THREE.Mesh(legGeo, mats.steelDark);
    leg.position.set(lx, 0.4, lz);
    g.add(leg);
  }

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.04, 0.05, 0.86),
    mats.steelDark
  );
  top.position.y = 0.795;
  g.add(top);

  // Security authorization memo sheet next to card
  const memoSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.34),
    mats.sessionReportPaperMat
  );
  memoSheet.rotation.x = -Math.PI / 2;
  memoSheet.rotation.z = -0.12;
  memoSheet.position.set(-0.24, 0.824, 0.04);
  g.add(memoSheet);

  // Backlit card tray
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.015, 0.2),
    mats.polymerMatte
  );
  tray.position.set(0.18, 0.828, 0.02);
  g.add(tray);

  const statusLed = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.015, 0.02),
    mats.blueStrip
  );
  statusLed.position.set(0.18, 0.838, -0.06);
  g.add(statusLed);

  // Collectible Magnetic Access Card group
  const cardGroup = new THREE.Group();
  cardGroup.position.set(0.18, 0.844, 0.03);
  cardGroup.rotation.y = -0.22;

  const cardBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.008, 0.125),
    mats.steelBrushed
  );
  const cardFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.195, 0.12),
    mats.accessCardMat
  );
  cardFace.rotation.x = -Math.PI / 2;
  cardFace.position.y = 0.0048;
  cardGroup.add(cardBody, cardFace);
  g.add(cardGroup);

  return { group: g, cardGroup };
}

/**
 * Heavy Sliding Security Bulkhead Door + Access Reader (Observation Room -> Memory Analysis Wing)
 * Door spans Z [-1.05..+1.05] in local space when rotated for East bulkhead at x = 4.2.
 */
export function createSecuredBulkhead(mats: PropMaterials): {
  group: THREE.Group;
  leftLeaf: THREE.Mesh;
  rightLeaf: THREE.Mesh;
  beaconMesh: THREE.Mesh;
} {
  const g = new THREE.Group();

  // Outer heavy steel jambs (along local X so rotating Y=PI/2 places along Z)
  const jambGeo = new THREE.BoxGeometry(0.26, 2.58, 0.44);
  const leftJamb = new THREE.Mesh(jambGeo, mats.steelDark);
  leftJamb.position.set(-1.14, 1.29, 0);
  const rightJamb = new THREE.Mesh(jambGeo, mats.steelDark);
  rightJamb.position.set(1.14, 1.29, 0);
  g.add(leftJamb, rightJamb);

  const header = new THREE.Mesh(
    new THREE.BoxGeometry(2.54, 0.34, 0.48),
    mats.steelDark
  );
  header.position.set(0, 2.62, 0);
  g.add(header);

  const threshold = new THREE.Mesh(
    new THREE.BoxGeometry(2.14, 0.025, 0.42),
    mats.steelBrushed
  );
  threshold.position.set(0, 0.0125, 0);
  g.add(threshold);

  // Sliding double blast leaves
  const leafGeo = new THREE.BoxGeometry(1.06, 2.44, 0.14);
  const leftLeaf = new THREE.Mesh(leafGeo, mats.steelBrushed);
  leftLeaf.position.set(-0.53, 1.24, 0);
  const rightLeaf = new THREE.Mesh(leafGeo, mats.steelBrushed);
  rightLeaf.position.set(0.53, 1.24, 0);
  g.add(leftLeaf, rightLeaf);

  // Status beacon above lintel (faces Observation Room on +Z local -> -X world when rotated -PI/2)
  const beaconMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.08, 0.12),
    mats.redBeacon
  );
  beaconMesh.position.set(0, 2.74, 0.24);
  g.add(beaconMesh);

  // Security Card Reader + Localized Status Plaque on right jamb
  const readerBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.34, 0.12),
    mats.polymerMatte
  );
  readerBody.position.set(1.16, 1.32, 0.22);
  g.add(readerBody);

  const plaqueMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.48, 0.24),
    mats.doorPlaqueMat
  );
  plaqueMesh.position.set(0, 2.25, 0.245);
  g.add(plaqueMesh);

  return { group: g, leftLeaf, rightLeaf, beaconMesh };
}

/**
 * Central Memory Analysis Console (Memory Analysis Laboratory Centerpiece)
 */
export function createMemoryAnalysisConsole(
  mats: PropMaterials
): THREE.Group {
  const g = new THREE.Group();
  addContactShadow(g, mats, 1.2, 1.2);

  // Octagonal / pedestal core base
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.18, 0.16, 8),
    mats.steelDark
  );
  plinth.position.y = 0.08;
  g.add(plinth);

  const coreColumn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.56, 0.72, 8),
    mats.polymerMatte
  );
  coreColumn.position.y = 0.52;
  g.add(coreColumn);

  // Console ring desk facing -X (world West toward incoming player -> local +Z)
  const deskDeck = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 0.07, 1.25),
    mats.steelDark
  );
  deskDeck.position.set(0, 0.9, 0);
  g.add(deskDeck);

  const keyboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.03, 0.24),
    mats.polymerMatte
  );
  keyboard.position.set(0, 0.95, 0.36);
  keyboard.rotation.x = 0.08;
  g.add(keyboard);

  // Primary display bezel + glowing localized readout screen
  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.34, 0.14),
    mats.steelBrushed
  );
  stand.position.set(0, 1.1, -0.14);
  g.add(stand);

  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(1.08, 0.68, 0.09),
    mats.polymerMatte
  );
  bezel.position.set(0, 1.44, -0.05);
  bezel.rotation.x = -0.1;
  g.add(bezel);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.98, 0.58),
    mats.memoryConsoleScreenMat
  );
  screen.position.set(0, 1.44, -0.002);
  screen.rotation.x = -0.1;
  g.add(screen);

  // Flanking neural telemetry monitors
  const sideBezelGeo = new THREE.BoxGeometry(0.56, 0.38, 0.07);
  const sideScreenGeo = new THREE.PlaneGeometry(0.48, 0.3);
  for (const dir of [-1, 1]) {
    const flank = new THREE.Group();
    flank.position.set(dir * 0.92, 1.28, 0.06);
    flank.rotation.y = dir * -0.32;
    flank.add(new THREE.Mesh(sideBezelGeo, mats.polymerMatte));
    const flankScreen = new THREE.Mesh(sideScreenGeo, mats.eegScreenGlow);
    flankScreen.position.z = 0.038;
    flank.add(flankScreen);
    g.add(flank);
  }

  return g;
}

/**
 * Neural Scan Diagnostic Station (Memory Analysis Wing North)
 */
export function createNeuralScanStation(mats: PropMaterials): THREE.Group {
  const g = new THREE.Group();
  addContactShadow(g, mats, 0.72, 0.52);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.82, 0.68),
    mats.steelDark
  );
  base.position.y = 0.41;
  g.add(base);

  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(1.24, 0.05, 0.74),
    mats.steelBrushed
  );
  trim.position.y = 0.84;
  g.add(trim);

  const housing = new THREE.Mesh(
    new THREE.BoxGeometry(0.86, 0.56, 0.14),
    mats.polymerMatte
  );
  housing.position.set(0, 1.24, -0.1);
  housing.rotation.x = -0.1;
  g.add(housing);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.48),
    mats.neuralScanScreenMat
  );
  screen.position.set(0, 1.24, -0.025);
  screen.rotation.x = -0.1;
  g.add(screen);

  const indicator = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.03, 0.03),
    mats.blueStrip
  );
  indicator.position.set(0.32, 0.9, 0.22);
  g.add(indicator);

  return g;
}

/**
 * Subject 047 Session Report Desk (Memory Analysis Wing South)
 */
export function createSessionReportDesk(mats: PropMaterials): THREE.Group {
  const g = new THREE.Group();
  addContactShadow(g, mats, 0.76, 0.52);

  const legGeo = new THREE.BoxGeometry(0.06, 0.75, 0.06);
  for (const [lx, lz] of [
    [-0.56, -0.34],
    [0.56, -0.34],
    [-0.56, 0.34],
    [0.56, 0.34],
  ]) {
    const leg = new THREE.Mesh(legGeo, mats.steelBrushed);
    leg.position.set(lx, 0.375, lz);
    g.add(leg);
  }

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.28, 0.05, 0.82),
    mats.steelDark
  );
  top.position.y = 0.775;
  g.add(top);

  const binder = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.02, 0.42),
    mats.polymerMatte
  );
  binder.position.set(0, 0.81, 0);
  binder.rotation.y = -0.12;
  g.add(binder);

  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.36),
    mats.sessionReportPaperMat
  );
  sheet.rotation.x = -Math.PI / 2;
  sheet.rotation.z = -0.12;
  sheet.position.set(0, 0.822, 0);
  g.add(sheet);

  const lampGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.04, 0.08),
    mats.blueStrip
  );
  lampGlow.position.set(-0.36, 1.08, -0.18);
  const lampPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.02, 0.3, 8),
    mats.steelBrushed
  );
  lampPost.position.set(-0.42, 0.94, -0.2);
  g.add(lampPost, lampGlow);

  return g;
}

/**
 * Suspended Neural Reconstruction Halo Core (beyond Lab East observation glass)
 */
export function createMemoryCoreRig(mats: PropMaterials): {
  group: THREE.Group;
  innerRing: THREE.Mesh;
  outerRing: THREE.Mesh;
} {
  const g = new THREE.Group();

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.55, 0.2, 20),
    mats.steelDark
  );
  plinth.position.y = 0.1;
  g.add(plinth);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.54, 1.15, 16),
    mats.polymerMatte
  );
  pedestal.position.y = 0.75;
  g.add(pedestal);

  const emitter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.25, 16),
    mats.blueStrip
  );
  emitter.position.y = 1.42;
  g.add(emitter);

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.22, 0.045, 10, 32),
    mats.steelBrushed
  );
  outerRing.position.y = 2.05;
  g.add(outerRing);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.86, 0.03, 10, 28),
    mats.blueStrip
  );
  innerRing.position.y = 2.05;
  innerRing.rotation.x = 0.45;
  g.add(innerRing);

  const ceilingAnchor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.18, 0.85, 12),
    mats.steelDark
  );
  ceilingAnchor.position.y = 3.4;
  g.add(ceilingAnchor);

  return { group: g, innerRing, outerRing };
}
