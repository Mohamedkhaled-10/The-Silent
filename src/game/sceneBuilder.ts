import * as THREE from 'three';
import { Locale } from '../i18n';
import {
  createAccessCardStand,
  createCorridorRib,
  createDoorBulkhead,
  createHumanSilhouette,
  createMedicalBed,
  createMemoryAnalysisConsole,
  createMemoryCoreRig,
  createNeuralScanStation,
  createObservationConsole,
  createPropMaterials,
  createRecordDesk,
  createSecuredBulkhead,
  createServerRack,
  createSessionReportDesk,
  createTelemetryCart,
  createTestChamberRig,
  createWallCabinet,
  PropMaterials,
} from './props';
import {
  createFacilityTextures,
  createLocalizedTextures,
  FacilityTextures,
  LocalizedTextures,
} from './textures';

export interface FacilitySceneHandles {
  flashlight: THREE.SpotLight;
  flashlightTarget: THREE.Object3D;
  silhouette: THREE.Group;
  silhouetteMaterial: THREE.MeshStandardMaterial;
  obsLights: { light: THREE.PointLight; baseIntensity: number }[];
  testBayBacklight: { light: THREE.PointLight; baseIntensity: number };
  redBeacons: THREE.PointLight[];
  setAccessCardVisible: (visible: boolean) => void;
  updateSecurityDoor: (unlocked: boolean, openProgress: number) => void;
  stepAmbientProps: (elapsedSeconds: number) => void;
  updateLocaleTextures: (locale: Locale, doorUnlocked?: boolean) => void;
  dispose: () => void;
}

export function buildFacilityScene(
  scene: THREE.Scene,
  maxAnisotropy: number,
  initialLocale: Locale = 'en'
): FacilitySceneHandles {
  const textures: FacilityTextures = createFacilityTextures(
    maxAnisotropy,
    initialLocale
  );
  let activeLocalized: LocalizedTextures | null = null;
  let currentDoorUnlocked = false;
  const propMats: PropMaterials = createPropMaterials(textures);

  const disposables: { dispose: () => void }[] = [];

  // Atmosphere & Fog
  const bgColor = new THREE.Color(0x03060a);
  scene.background = bgColor;
  scene.fog = new THREE.FogExp2(0x03060a, 0.056);

  // Shared Architectural Materials
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.wallMap,
    bumpMap: textures.wallBump,
    bumpScale: 0.025,
    roughness: 0.78,
    metalness: 0.12,
  });
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.floorMap,
    bumpMap: textures.floorBump,
    bumpScale: 0.02,
    roughness: 0.56,
    metalness: 0.24,
  });
  const ceilMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.ceilingMap,
    roughness: 0.85,
    metalness: 0.15,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaad4ec,
    transparent: true,
    opacity: 0.2,
    roughness: 0.08,
    metalness: 0.15,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    depthWrite: false,
  });
  disposables.push(wallMat, floorMat, ceilMat, glassMat);

  const addBox = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    disposables.push(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  };

  // =========================================================
  // 1. AWAKENING CHAMBER (x: -3.2..3.2, z: -3.0..3.5, h: 3.2)
  // =========================================================
  addBox(6.6, 0.2, 6.7, 0, -0.1, 0.25, floorMat);
  addBox(6.6, 0.2, 6.7, 0, 3.3, 0.25, ceilMat);
  addBox(6.6, 3.2, 0.25, 0, 1.6, 3.6, wallMat);
  addBox(0.25, 3.2, 6.7, -3.32, 1.6, 0.25, wallMat);
  addBox(0.25, 3.2, 6.7, 3.32, 1.6, 0.25, wallMat);
  addBox(2.35, 3.2, 0.28, -2.22, 1.6, -3.0, wallMat);
  addBox(2.35, 3.2, 0.28, 2.22, 1.6, -3.0, wallMat);
  addBox(2.2, 0.72, 0.28, 0, 2.84, -3.0, wallMat);

  addBox(1.5, 0.05, 0.6, 0, 3.18, 0.4, propMats.blueStrip);

  const bed = createMedicalBed(propMats);
  bed.position.set(-2.2, 0, 0.92);
  scene.add(bed);

  const cart = createTelemetryCart(propMats);
  cart.position.set(-2.35, 0, -1.25);
  cart.rotation.y = 0.55;
  scene.add(cart);

  const cabinet = createWallCabinet(propMats);
  cabinet.position.set(2.85, 0, 0.6);
  scene.add(cabinet);

  const bulkhead1 = createDoorBulkhead(propMats);
  bulkhead1.position.set(0, 0, -3.0);
  scene.add(bulkhead1);

  // =========================================================
  // 2. RESEARCH CORRIDOR (x: -1.6..1.6, z: -15.0..-3.0, h: 3.2)
  // =========================================================
  addBox(3.4, 0.2, 12.2, 0, -0.1, -9.0, floorMat);
  addBox(3.4, 0.2, 12.2, 0, 3.3, -9.0, ceilMat);
  addBox(0.25, 3.2, 12.2, -1.72, 1.6, -9.0, wallMat);
  addBox(0.25, 3.2, 12.2, 1.72, 1.6, -9.0, wallMat);

  addBox(0.65, 0.018, 11.4, 0, 0.009, -9.0, propMats.steelDark);

  const pipeGeo = new THREE.CylinderGeometry(0.045, 0.045, 11.8, 8);
  pipeGeo.rotateX(Math.PI / 2);
  disposables.push(pipeGeo);
  for (const px of [-1.18, 1.18]) {
    const pipe = new THREE.Mesh(pipeGeo, propMats.steelBrushed);
    pipe.position.set(px, 2.86, -9.0);
    scene.add(pipe);
  }

  for (const [rz, lit] of [
    [-6.0, true],
    [-9.5, false],
    [-13.0, true],
  ] as [number, boolean][]) {
    const rib = createCorridorRib(propMats, lit);
    rib.position.set(0, 0, rz);
    scene.add(rib);
  }

  addBox(0.18, 0.08, 0.14, -1.52, 2.55, -9.5, propMats.redBeacon);

  // =========================================================
  // 3. OBSERVATION ROOM (x: -4.2..4.2, z: -21.0..-15.0, h: 3.2)
  // =========================================================
  addBox(8.6, 0.2, 6.2, 0, -0.1, -18.0, floorMat);
  addBox(8.6, 0.2, 6.2, 0, 3.3, -18.0, ceilMat);
  addBox(3.35, 3.2, 0.28, -2.72, 1.6, -15.0, wallMat);
  addBox(3.35, 3.2, 0.28, 2.72, 1.6, -15.0, wallMat);
  addBox(2.2, 0.72, 0.28, 0, 2.84, -15.0, wallMat);

  // West wall
  addBox(0.25, 3.2, 6.2, -4.32, 1.6, -18.0, wallMat);

  // East bulkhead wall with secured doorway gap z [-19.05..-16.95], y [0..2.55]
  addBox(0.28, 3.2, 2.15, 4.32, 1.6, -20.12, wallMat);
  addBox(0.28, 3.2, 2.15, 4.32, 1.6, -15.92, wallMat);
  addBox(0.28, 0.7, 2.2, 4.32, 2.85, -18.0, wallMat);

  const bulkhead2 = createDoorBulkhead(propMats);
  bulkhead2.position.set(0, 0, -15.0);
  scene.add(bulkhead2);

  // Secured Security Bulkhead Door at East Wall (x = 4.28, z = -18.0)
  const securedDoor = createSecuredBulkhead(propMats);
  securedDoor.group.position.set(4.28, 0, -18.0);
  securedDoor.group.rotation.y = -Math.PI / 2;
  scene.add(securedDoor.group);

  // Observation Room Glass Partition Wall (z = -21.0)
  addBox(1.5, 3.2, 0.28, -3.75, 1.6, -21.0, wallMat);
  addBox(1.5, 3.2, 0.28, 3.75, 1.6, -21.0, wallMat);
  addBox(6.0, 0.95, 0.28, 0, 0.475, -21.0, wallMat);
  addBox(6.0, 0.55, 0.28, 0, 2.925, -21.0, wallMat);
  addBox(6.0, 0.06, 0.34, 0, 0.96, -21.0, propMats.steelBrushed);
  addBox(0.1, 1.7, 0.18, -1.5, 1.8, -21.0, propMats.steelDark);
  addBox(0.1, 1.7, 0.18, 1.5, 1.8, -21.0, propMats.steelDark);

  const glassMesh = addBox(5.96, 1.66, 0.04, 0, 1.8, -21.0, glassMat);
  glassMesh.renderOrder = 5;

  addBox(2.4, 0.05, 0.45, 0, 3.18, -18.0, propMats.blueStrip);

  const mainConsole = createObservationConsole(propMats);
  mainConsole.position.set(0, 0, -19.75);
  scene.add(mainConsole);

  const recordDesk = createRecordDesk(propMats);
  recordDesk.position.set(-2.72, 0, -18.2);
  recordDesk.rotation.y = Math.PI / 2;
  scene.add(recordDesk);

  // Relocated NE Server Rack
  const serverRack = createServerRack(propMats);
  serverRack.position.set(3.32, 0, -20.0);
  scene.add(serverRack);

  // SE Security Stand with Collectible Access Card
  const accessStand = createAccessCardStand(propMats);
  accessStand.group.position.set(3.1, 0, -16.1);
  accessStand.group.rotation.y = -Math.PI * 0.72;
  scene.add(accessStand.group);

  // =========================================================
  // 4. BEYOND-GLASS TEST BAY (x: -5..5, z: -31..-21, h: 4.0)
  // =========================================================
  addBox(10.2, 0.2, 10.2, 0, -0.1, -26.0, floorMat);
  addBox(10.2, 0.2, 10.2, 0, 4.1, -26.0, ceilMat);
  addBox(10.2, 4.2, 0.3, 0, 2.0, -31.1, wallMat);
  addBox(0.3, 4.2, 10.2, -5.1, 2.0, -26.0, wallMat);
  addBox(0.3, 4.2, 10.2, 5.1, 2.0, -26.0, wallMat);

  addBox(0.45, 4.0, 0.45, -3.2, 2.0, -25.5, propMats.steelDark);
  addBox(0.45, 4.0, 0.45, 3.2, 2.0, -25.5, propMats.steelDark);

  const testRig = createTestChamberRig(propMats);
  testRig.position.set(0, 0, -25.2);
  scene.add(testRig);

  const silhouette = createHumanSilhouette(propMats);
  silhouette.position.set(1.85, 0, -25.2);
  silhouette.rotation.y = -0.28;
  silhouette.visible = false;
  scene.add(silhouette);

  // =========================================================
  // 5. MEMORY ANALYSIS WING (East of Observation Room)
  // 5a. Entry Vestibule (x: 4.3..8.6, z: -20.0..-16.0, h: 3.2)
  // =========================================================
  addBox(4.5, 0.2, 4.4, 6.45, -0.1, -18.0, floorMat);
  addBox(4.5, 0.2, 4.4, 6.45, 3.3, -18.0, ceilMat);
  addBox(4.5, 3.2, 0.28, 6.45, 1.6, -20.1, wallMat); // North wall
  addBox(4.5, 3.2, 0.28, 6.45, 1.6, -15.9, wallMat); // South wall

  // Vestibule steel guide strip & overhead lighting strip
  addBox(3.9, 0.018, 0.72, 6.45, 0.009, -18.0, propMats.steelDark);
  addBox(1.8, 0.05, 0.35, 6.45, 3.18, -18.0, propMats.blueStrip);

  // Open portal bulkhead into Laboratory at x = 8.6 (opening z [-19.25..-16.75])
  addBox(0.28, 3.8, 3.9, 8.6, 1.9, -21.2, wallMat);
  addBox(0.28, 3.8, 3.9, 8.6, 1.9, -14.8, wallMat);
  addBox(0.28, 1.25, 2.7, 8.6, 3.22, -18.0, wallMat);
  addBox(0.32, 2.65, 0.24, 8.6, 1.325, -19.25, propMats.steelDark);
  addBox(0.32, 2.65, 0.24, 8.6, 1.325, -16.75, propMats.steelDark);

  // =========================================================
  // 5b. Memory Analysis Laboratory (x: 8.6..17.6, z: -23.0..-13.0, h: 3.8)
  // =========================================================
  addBox(9.4, 0.2, 10.4, 13.1, -0.1, -18.0, floorMat);
  addBox(9.4, 0.2, 10.4, 13.1, 3.9, -18.0, ceilMat);
  addBox(9.4, 3.8, 0.28, 13.1, 1.9, -23.1, wallMat); // North wall
  addBox(9.4, 3.8, 0.28, 13.1, 1.9, -12.9, wallMat); // South wall

  // Raised floor main walkway conduit leading to Central Console
  addBox(4.8, 0.018, 0.85, 11.2, 0.009, -18.0, propMats.steelDark);

  // Overhead lab structural cross-beams & cool blue light strips
  for (const bx of [10.6, 13.8]) {
    addBox(0.28, 0.26, 10.0, bx, 3.68, -18.0, propMats.steelDark);
    addBox(0.18, 0.04, 3.6, bx, 3.53, -18.0, propMats.blueStrip);
  }
  // Controlled red warning strips flanking East Core observation partition
  addBox(0.16, 0.08, 0.16, 17.3, 3.25, -21.2, propMats.redBeacon);
  addBox(0.16, 0.08, 0.16, 17.3, 3.25, -14.8, propMats.redBeacon);

  // East Observation Glass Partition Wall at x = 17.6 (looking into Neural Core Bay)
  addBox(0.3, 3.8, 2.1, 17.6, 1.9, -22.1, wallMat);
  addBox(0.3, 3.8, 2.1, 17.6, 1.9, -13.9, wallMat);
  addBox(0.3, 0.92, 6.4, 17.6, 0.46, -18.0, wallMat); // Lower parapet
  addBox(0.3, 0.72, 6.4, 17.6, 3.44, -18.0, wallMat); // Upper header
  addBox(0.36, 0.06, 6.3, 17.6, 0.94, -18.0, propMats.steelBrushed);
  addBox(0.18, 2.2, 0.12, 17.6, 2.02, -19.6, propMats.steelDark);
  addBox(0.18, 2.2, 0.12, 17.6, 2.02, -16.4, propMats.steelDark);
  const labGlass = addBox(0.04, 2.12, 6.2, 17.6, 2.02, -18.0, glassMat);
  labGlass.renderOrder = 5;

  // Central Memory Analysis Console at (14.3, 0, -18.0), facing West (-X)
  const memoryConsole = createMemoryAnalysisConsole(propMats);
  memoryConsole.position.set(14.3, 0, -18.0);
  memoryConsole.rotation.y = -Math.PI / 2;
  scene.add(memoryConsole);

  // Secondary Inspectable 1: Neural Scan Monitor Station (North Wall)
  const neuralScanStation = createNeuralScanStation(propMats);
  neuralScanStation.position.set(11.4, 0, -21.85);
  scene.add(neuralScanStation);

  // Secondary Inspectable 2: Subject 047 Session Report Desk (South Wall)
  const sessionReportDesk = createSessionReportDesk(propMats);
  sessionReportDesk.position.set(11.4, 0, -14.15);
  sessionReportDesk.rotation.y = Math.PI;
  scene.add(sessionReportDesk);

  // Flanking Cryo/Data Server Towers inside Lab
  const towerNorth = createServerRack(propMats);
  towerNorth.position.set(16.55, 0, -21.6);
  const towerSouth = createServerRack(propMats);
  towerSouth.position.set(16.55, 0, -14.4);
  scene.add(towerNorth, towerSouth);

  // =========================================================
  // 5c. Neural Reconstruction Core Bay (x: 17.6..22.2, z: -22.5..-13.5, h: 3.8)
  // =========================================================
  addBox(4.8, 0.2, 9.4, 19.9, -0.1, -18.0, floorMat);
  addBox(4.8, 0.2, 9.4, 19.9, 3.9, -18.0, ceilMat);
  addBox(0.3, 3.8, 9.4, 22.15, 1.9, -18.0, wallMat);
  addBox(4.8, 3.8, 0.3, 19.9, 1.9, -22.6, wallMat);
  addBox(4.8, 3.8, 0.3, 19.9, 1.9, -13.4, wallMat);

  const memoryCoreRig = createMemoryCoreRig(propMats);
  memoryCoreRig.group.position.set(19.9, 0, -18.0);
  scene.add(memoryCoreRig.group);

  // =========================================================
  // 6. PERFORMANCE-OPTIMIZED LIGHTING RIG (Zero shadowMap passes)
  // =========================================================
  const hemiLight = new THREE.HemisphereLight(0x7caad0, 0x060a10, 0.28);
  scene.add(hemiLight);

  const awakeningLight = new THREE.PointLight(0xb2d8f5, 3.1, 9.5, 1.7);
  awakeningLight.position.set(0, 2.85, 0.4);
  scene.add(awakeningLight);

  const corridorLight1 = new THREE.PointLight(0x8bb8e0, 2.1, 8.0, 1.8);
  corridorLight1.position.set(0, 2.75, -6.0);
  scene.add(corridorLight1);

  const corridorRedLight = new THREE.PointLight(0xd93838, 2.5, 7.2, 1.7);
  corridorRedLight.position.set(-1.1, 2.4, -9.5);
  scene.add(corridorRedLight);

  const corridorLight2 = new THREE.PointLight(0x8bb8e0, 2.0, 8.0, 1.8);
  corridorLight2.position.set(0, 2.75, -13.0);
  scene.add(corridorLight2);

  const obsMainLight = new THREE.PointLight(0x9bc8eb, 3.0, 10.5, 1.6);
  obsMainLight.position.set(0, 2.85, -18.0);
  scene.add(obsMainLight);

  const obsDeskLight = new THREE.PointLight(0x8fd0fa, 2.8, 5.2, 1.6);
  obsDeskLight.position.set(-2.55, 1.55, -18.2);
  scene.add(obsDeskLight);

  const testBayBacklight = new THREE.PointLight(0x78aedb, 5.2, 13.5, 1.35);
  testBayBacklight.position.set(0, 2.85, -29.2);
  scene.add(testBayBacklight);

  // Memory Analysis Wing Lights (Vestibule + Lab + Core Bay)
  const vestibuleLight = new THREE.PointLight(0x8bb8e0, 2.6, 8.0, 1.65);
  vestibuleLight.position.set(6.45, 2.85, -18.0);
  scene.add(vestibuleLight);

  const labCenterLight = new THREE.PointLight(0xa3d1f5, 3.6, 13.5, 1.5);
  labCenterLight.position.set(12.6, 3.25, -18.0);
  scene.add(labCenterLight);

  const coreBayLight = new THREE.PointLight(0x5fa8e6, 4.4, 11.0, 1.4);
  coreBayLight.position.set(19.9, 2.8, -18.0);
  scene.add(coreBayLight);

  // Player Flashlight
  const flashlight = new THREE.SpotLight(
    0xe6f6ff,
    15.0,
    20.0,
    Math.PI / 5.5,
    0.55,
    1.45
  );
  const flashlightTarget = new THREE.Object3D();
  scene.add(flashlight);
  scene.add(flashlightTarget);
  flashlight.target = flashlightTarget;

  const applyDoorPlaqueTexture = (unlocked: boolean) => {
    const texSet = activeLocalized ?? textures;
    const plaqueMap = unlocked
      ? texSet.doorPlaqueUnlockedMap
      : texSet.doorPlaqueLockedMap;
    propMats.doorPlaqueMat.map = plaqueMap;
    propMats.doorPlaqueMat.emissiveMap = plaqueMap;
    propMats.doorPlaqueMat.needsUpdate = true;
  };

  return {
    flashlight,
    flashlightTarget,
    silhouette,
    silhouetteMaterial: propMats.silhouette,
    obsLights: [
      { light: obsMainLight, baseIntensity: 3.0 },
      { light: obsDeskLight, baseIntensity: 2.8 },
      { light: corridorLight2, baseIntensity: 2.0 },
    ],
    testBayBacklight: { light: testBayBacklight, baseIntensity: 5.2 },
    redBeacons: [corridorRedLight],
    setAccessCardVisible: (visible: boolean) => {
      accessStand.cardGroup.visible = visible;
    },
    updateSecurityDoor: (unlocked: boolean, openProgress: number) => {
      const clamped = Math.max(0, Math.min(1, openProgress));
      // Smooth ease-out slide apart (1.02m per leaf clears full 2.0m doorway)
      const slide = 1 - Math.pow(1 - clamped, 3);
      securedDoor.leftLeaf.position.x = -0.53 - slide * 1.02;
      securedDoor.rightLeaf.position.x = 0.53 + slide * 1.02;

      if (unlocked !== currentDoorUnlocked) {
        currentDoorUnlocked = unlocked;
        securedDoor.beaconMesh.material = unlocked
          ? propMats.greenBeacon
          : propMats.redBeacon;
        applyDoorPlaqueTexture(unlocked);
      }
    },
    stepAmbientProps: (elapsedSeconds: number) => {
      memoryCoreRig.outerRing.rotation.y = elapsedSeconds * 0.22;
      memoryCoreRig.innerRing.rotation.y = -elapsedSeconds * 0.38;
      memoryCoreRig.innerRing.rotation.z =
        Math.sin(elapsedSeconds * 0.45) * 0.25;
    },
    updateLocaleTextures: (locale: Locale, doorUnlocked?: boolean) => {
      if (typeof doorUnlocked === 'boolean') {
        currentDoorUnlocked = doorUnlocked;
      }
      const next = createLocalizedTextures(locale, maxAnisotropy);
      propMats.screenGlow.map = next.terminalScreenMap;
      propMats.screenGlow.emissiveMap = next.terminalScreenMap;
      propMats.screenGlow.needsUpdate = true;

      propMats.eegScreenGlow.map = next.eegScreenMap;
      propMats.eegScreenGlow.emissiveMap = next.eegScreenMap;
      propMats.eegScreenGlow.needsUpdate = true;

      propMats.dossierPaper.map = next.dossierPaperMap;
      propMats.dossierPaper.needsUpdate = true;

      propMats.accessCardMat.map = next.accessCardMap;
      propMats.accessCardMat.emissiveMap = next.accessCardMap;
      propMats.accessCardMat.needsUpdate = true;

      propMats.memoryConsoleScreenMat.map = next.memoryConsoleMap;
      propMats.memoryConsoleScreenMat.emissiveMap = next.memoryConsoleMap;
      propMats.memoryConsoleScreenMat.needsUpdate = true;

      propMats.neuralScanScreenMat.map = next.neuralScanMap;
      propMats.neuralScanScreenMat.emissiveMap = next.neuralScanMap;
      propMats.neuralScanScreenMat.needsUpdate = true;

      propMats.sessionReportPaperMat.map = next.sessionReportMap;
      propMats.sessionReportPaperMat.needsUpdate = true;

      const plaqueMap = currentDoorUnlocked
        ? next.doorPlaqueUnlockedMap
        : next.doorPlaqueLockedMap;
      propMats.doorPlaqueMat.map = plaqueMap;
      propMats.doorPlaqueMat.emissiveMap = plaqueMap;
      propMats.doorPlaqueMat.needsUpdate = true;

      if (activeLocalized) {
        activeLocalized.dispose();
      } else {
        textures.terminalScreenMap.dispose();
        textures.eegScreenMap.dispose();
        textures.dossierPaperMap.dispose();
        textures.accessCardMap.dispose();
        textures.doorPlaqueLockedMap.dispose();
        textures.doorPlaqueUnlockedMap.dispose();
        textures.memoryConsoleMap.dispose();
        textures.neuralScanMap.dispose();
        textures.sessionReportMap.dispose();
      }
      activeLocalized = next;
    },
    dispose: () => {
      const disposedGeos = new Set<THREE.BufferGeometry>();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.geometry) {
          if (!disposedGeos.has(obj.geometry)) {
            disposedGeos.add(obj.geometry);
            obj.geometry.dispose();
          }
        }
      });
      for (const item of disposables) {
        item.dispose();
      }
      if (activeLocalized) {
        activeLocalized.dispose();
      }
      propMats.dispose();
      textures.dispose();
    },
  };
}

