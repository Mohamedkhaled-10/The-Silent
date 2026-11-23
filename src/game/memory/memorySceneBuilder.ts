import * as THREE from 'three';
import { Locale, translateKey } from '../../i18n';
import {
  MemoryFragmentId,
  MemorySessionState,
} from './memoryTypes';

export interface MemorySceneHandles {
  scene: THREE.Scene;
  flashlight: THREE.SpotLight;
  flashlightTarget: THREE.Object3D;
  updateLocaleTextures: (locale: Locale, photoChanged: boolean) => void;
  setPhotoChanged: (changed: boolean) => void;
  stepVisuals: (
    session: MemorySessionState,
    elapsed: number,
    dt: number,
    flashlightOn: boolean
  ) => void;
  dispose: () => void;
}

function makeCanvas(
  w: number,
  h: number
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

function makeTex(
  canvas: HTMLCanvasElement,
  isColor: boolean,
  anisotropy: number,
  rx = 1,
  ry = 1
): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = Math.min(Math.max(1, anisotropy), 4);
  t.needsUpdate = true;
  return t;
}

function isolateLtr(text: string): string {
  return text.replace(
    /([A-Za-z0-9]+(?:[\s\-_/]+[A-Za-z0-9]+)*)/g,
    '\u2066$1\u2069'
  );
}

function createHardwoodTexture(aniso: number): {
  map: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
} {
  const [c, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#3c291d';
  ctx.fillRect(0, 0, 512, 512);

  const plankH = 64;
  for (let row = 0; row < 8; row++) {
    const y = row * plankH;
    const tone = (row % 3) * 6 - 4;
    ctx.fillStyle = `rgb(${58 + tone}, ${39 + tone}, ${27 + tone})`;
    ctx.fillRect(0, y + 1, 512, plankH - 2);
    // Subtle wood grain
    ctx.strokeStyle = 'rgba(20, 12, 8, 0.25)';
    ctx.lineWidth = 1;
    for (let g = 0; g < 6; g++) {
      ctx.beginPath();
      const gy = y + 8 + g * 9;
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(160, gy + 2, 340, gy - 2, 512, gy + 1);
      ctx.stroke();
    }
    const offset = (row % 2) * 256;
    ctx.fillStyle = '#1d130d';
    ctx.fillRect(offset, y, 2, plankH);
    ctx.fillRect(0, y, 512, 2);
  }

  const [bc, bctx] = makeCanvas(256, 256);
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 256, 256);
  bctx.fillStyle = '#404040';
  for (let row = 0; row < 8; row++) {
    bctx.fillRect(0, row * 32, 256, 2);
  }

  return {
    map: makeTex(c, true, aniso, 5, 5),
    bump: makeTex(bc, false, aniso, 5, 5),
  };
}

function createWallpaperTexture(aniso: number): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#382f29';
  ctx.fillRect(0, 0, 256, 256);
  // Vertical subtle stripes
  ctx.fillStyle = 'rgba(255, 224, 185, 0.03)';
  for (let x = 0; x < 256; x += 16) {
    ctx.fillRect(x, 0, 6, 256);
  }
  // Lower wainscot band
  ctx.fillStyle = '#251d18';
  ctx.fillRect(0, 178, 256, 78);
  ctx.fillStyle = '#4c3b2f';
  ctx.fillRect(0, 174, 256, 5);
  return makeTex(c, true, aniso, 4, 1);
}

function createRainWindowTexture(aniso: number): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#0c1522');
  grad.addColorStop(1, '#152436');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Soft rain streak droplets
  for (let i = 0; i < 85; i++) {
    const x = (i * 37) % 256;
    const y = (i * 71) % 256;
    const len = 12 + (i % 5) * 8;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(165, 205, 240, 0.48)' : 'rgba(125, 165, 205, 0.26)';
    ctx.lineWidth = i % 4 === 0 ? 1.8 : 1.0;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 1, y + len);
    ctx.stroke();
  }
  return makeTex(c, true, aniso, 2, 2);
}

function createClockFaceTexture(aniso: number): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#ede2cf';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3a2c22';
  ctx.lineWidth = 6;
  ctx.stroke();

  // 12 dial marks
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const r1 = i % 3 === 0 ? 86 : 94;
    const r2 = 108;
    ctx.strokeStyle = '#2b2019';
    ctx.lineWidth = i % 3 === 0 ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(128 + Math.cos(a) * r1, 128 + Math.sin(a) * r1);
    ctx.lineTo(128 + Math.cos(a) * r2, 128 + Math.sin(a) * r2);
    ctx.stroke();
  }

  // Digital/engraved subtitle
  ctx.fillStyle = '#4e3e33';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('11:42', 128, 182);

  // Frozen hands at 11:42:
  // Hour hand: ~11.7 -> 11 + 42/60 hours = 11.7 * 30deg - 90 = 261deg
  const hourAngle = ((11 + 42 / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = '#1b1410';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(128 + Math.cos(hourAngle) * 56, 128 + Math.sin(hourAngle) * 56);
  ctx.stroke();

  // Minute hand: 42 min -> 42/60 * 360 - 90 = 162deg
  const minAngle = (42 / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(128 + Math.cos(minAngle) * 82, 128 + Math.sin(minAngle) * 82);
  ctx.stroke();

  ctx.fillStyle = '#1b1410';
  ctx.beginPath();
  ctx.arc(128, 128, 6, 0, Math.PI * 2);
  ctx.fill();

  return makeTex(c, true, aniso);
}

function drawPhotoCanvas(
  ctx: CanvasRenderingContext2D,
  locale: Locale,
  changed: boolean
): void {
  ctx.fillStyle = '#191310';
  ctx.fillRect(0, 0, 256, 320);

  // Matte frame interior
  ctx.fillStyle = changed ? '#1e1c21' : '#3a2c22';
  ctx.fillRect(16, 16, 224, 240);

  // Warm lamp backdrop inside photo
  const bg = ctx.createLinearGradient(16, 16, 16, 256);
  bg.addColorStop(0, changed ? '#262b36' : '#533b28');
  bg.addColorStop(1, changed ? '#121318' : '#241913');
  ctx.fillStyle = bg;
  ctx.fillRect(24, 24, 208, 224);

  // Window glow inside photo
  ctx.fillStyle = changed ? 'rgba(130, 165, 210, 0.25)' : 'rgba(255, 200, 130, 0.22)';
  ctx.fillRect(54, 46, 70, 92);

  // Two indistinct blurred family silhouettes seated
  ctx.fillStyle = 'rgba(22, 16, 14, 0.88)';
  // Left figure
  ctx.beginPath();
  ctx.arc(92, 146, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(70, 164, 44, 72);
  // Right figure
  ctx.beginPath();
  ctx.arc(148, 152, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(128, 168, 40, 68);

  if (changed) {
    // Subtle extra dark standing silhouette near doorway / window edge
    ctx.fillStyle = 'rgba(5, 7, 12, 0.96)';
    ctx.beginPath();
    ctx.arc(192, 114, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(174, 130, 36, 108);
    // Faint cold rim highlight
    ctx.strokeStyle = 'rgba(130, 185, 235, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, 208, 224);
  }

  // Bottom caption plate
  ctx.fillStyle = '#0f0c0b';
  ctx.fillRect(16, 264, 224, 40);
  const raw = translateKey(
    locale,
    changed ? 'memory.canvas.photoAltered' : 'memory.canvas.photoNormal'
  );
  const label = locale === 'ar' ? isolateLtr(raw) : raw;
  ctx.fillStyle = changed ? '#93c5fd' : '#d6c1aa';
  ctx.font =
    locale === 'ar'
      ? '600 15px "Cairo", "Tahoma", sans-serif'
      : 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 128, 284);
}

export function buildMemoryScene(
  _fragmentId: MemoryFragmentId,
  maxAnisotropy: number,
  initialLocale: Locale
): MemorySceneHandles {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b090c);
  scene.fog = new THREE.FogExp2(0x100c10, 0.045);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    textures.push(t);
    return t;
  };

  // Textures
  const wood = createHardwoodTexture(maxAnisotropy);
  trackTex(wood.map);
  trackTex(wood.bump);
  const wallTex = trackTex(createWallpaperTexture(maxAnisotropy));
  const rainTex = trackTex(createRainWindowTexture(maxAnisotropy));
  const clockTex = trackTex(createClockFaceTexture(maxAnisotropy));

  const [photoCanvas, photoCtx] = makeCanvas(256, 320);
  drawPhotoCanvas(photoCtx, initialLocale, false);
  const photoTex = trackTex(makeTex(photoCanvas, true, maxAnisotropy));

  // Materials
  const floorMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: wood.map,
      bumpMap: wood.bump,
      bumpScale: 0.012,
      roughness: 0.72,
      metalness: 0.06,
    })
  );
  const wallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: wallTex,
      roughness: 0.86,
      metalness: 0.04,
    })
  );
  const ceilingMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x221c19,
      roughness: 0.9,
      metalness: 0.04,
    })
  );
  const darkWoodMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x4b3324,
      roughness: 0.62,
      metalness: 0.08,
    })
  );
  const trimWoodMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x2c1d15,
      roughness: 0.68,
      metalness: 0.06,
    })
  );
  const sofaMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3b312d,
      roughness: 0.92,
      metalness: 0.02,
    })
  );
  const cushionMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x56443b,
      roughness: 0.88,
      metalness: 0.02,
    })
  );
  const rugMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x4b2b27,
      roughness: 0.95,
      metalness: 0.02,
    })
  );
  const lampShadeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf4cfa0,
      emissive: 0xffb366,
      emissiveIntensity: 0.95,
      roughness: 0.6,
      metalness: 0.05,
    })
  );
  const brassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x9b7e50,
      roughness: 0.38,
      metalness: 0.22,
    })
  );
  const blackPlasticMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1a191b,
      roughness: 0.45,
      metalness: 0.14,
    })
  );
  const rainGlassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: rainTex,
      emissive: 0x385778,
      emissiveMap: rainTex,
      emissiveIntensity: 0.68,
      roughness: 0.22,
      metalness: 0.12,
    })
  );

  // Lighting (warm tungsten interior + cool overcast night window)
  const hemi = new THREE.HemisphereLight(0xffdfb8, 0x1b1520, 0.72);
  scene.add(hemi);

  const hallLight = new THREE.PointLight(0xffb470, 3.2, 9.5, 1.5);
  hallLight.position.set(0, 2.38, 0.1);
  scene.add(hallLight);

  const livingLight = new THREE.PointLight(0xffc387, 5.4, 14.0, 1.4);
  livingLight.position.set(-0.8, 2.32, -5.0);
  scene.add(livingLight);

  const studyLight = new THREE.PointLight(0xffb16b, 3.8, 10.5, 1.5);
  studyLight.position.set(5.55, 1.65, -4.7);
  scene.add(studyLight);

  const windowNightLight = new THREE.PointLight(0x6d93c4, 2.4, 10.0, 1.6);
  windowNightLight.position.set(-0.2, 1.55, -7.1);
  scene.add(windowNightLight);

  // Subtle player-carried flashlight rig (matches facility [F] control seamlessly)
  const flashlight = new THREE.SpotLight(
    0xffe9d2,
    8.5,
    16,
    Math.PI / 5.2,
    0.55,
    1.5
  );
  const flashlightTarget = new THREE.Object3D();
  scene.add(flashlight);
  scene.add(flashlightTarget);
  flashlight.target = flashlightTarget;

  const H = 2.75; // Apartment ceiling height

  const addBox = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material,
    parent: THREE.Object3D = scene
  ): THREE.Mesh => {
    const m = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, h, d)), mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  // --- Floor & Ceiling slabs covering Apartment zones ---
  addBox(3.7, 0.1, 4.1, 0, -0.05, -0.2, floorMat); // Entrance Hall
  addBox(3.7, 0.1, 4.1, 0, H + 0.05, -0.2, ceilingMat);

  addBox(7.6, 0.1, 5.8, -0.1, -0.05, -5.0, floorMat); // Living Room
  addBox(7.6, 0.1, 5.8, -0.1, H + 0.05, -5.0, ceilingMat);

  addBox(3.6, 0.1, 5.2, 5.3, -0.05, -5.1, floorMat); // Small Study
  addBox(3.6, 0.1, 5.2, 5.3, H + 0.05, -5.1, ceilingMat);

  // Rug under Living Room sofa & coffee table (offset Y >= 0.02 to avoid Z-fighting)
  addBox(2.9, 0.022, 2.4, -0.3, 0.015, -5.15, rugMat);

  // --- Entrance Hall Walls ---
  addBox(3.8, H, 0.2, 0, H / 2, 1.85, wallMat); // South
  addBox(0.2, H, 4.1, -1.9, H / 2, -0.2, wallMat); // West
  addBox(0.2, H, 4.1, 1.9, H / 2, -0.2, wallMat); // East
  // Partition wall with Entrance Archway (open x [-1.05, 1.05])
  addBox(2.85, H, 0.22, -2.48, H / 2, -2.2, wallMat);
  addBox(2.65, H, 0.22, 2.38, H / 2, -2.2, wallMat);
  addBox(2.15, 0.48, 0.22, 0, H - 0.24, -2.2, wallMat); // Arch lintel
  addBox(0.08, 2.27, 0.26, -1.04, 1.135, -2.2, trimWoodMat);
  addBox(0.08, 2.27, 0.26, 1.04, 1.135, -2.2, trimWoodMat);
  addBox(2.16, 0.08, 0.26, 0, 2.29, -2.2, trimWoodMat);

  // Entrance console table + coat rack prop
  addBox(0.55, 0.76, 1.35, 1.45, 0.38, -0.35, darkWoodMat);

  // --- Living Room Walls ---
  addBox(0.2, H, 5.8, -3.9, H / 2, -5.0, wallMat); // West
  // North wall framed around rain window (x in [-1.45, 1.45], y in [0.85, 2.25])
  addBox(2.55, H, 0.22, -2.68, H / 2, -7.9, wallMat); // NW wall (Clock hangs here)
  addBox(2.35, H, 0.22, 2.58, H / 2, -7.9, wallMat); // NE wall
  addBox(2.92, 0.86, 0.22, 0, 0.43, -7.9, wallMat); // Below window
  addBox(2.92, 0.52, 0.22, 0, H - 0.26, -7.9, wallMat); // Above window
  // Window mullions & rain glass
  addBox(2.86, 1.36, 0.04, 0, 1.55, -7.92, rainGlassMat);
  addBox(0.07, 1.4, 0.14, 0, 1.55, -7.86, trimWoodMat);
  addBox(2.96, 0.07, 0.16, 0, 0.87, -7.85, trimWoodMat);
  addBox(2.96, 0.07, 0.16, 0, 2.24, -7.85, trimWoodMat);

  // Living Room -> Small Study East divider (open doorway z [-6.2, -4.4])
  addBox(0.22, H, 1.85, 3.6, H / 2, -7.08, wallMat);
  addBox(0.22, H, 2.25, 3.6, H / 2, -3.28, wallMat);
  addBox(0.22, 0.48, 1.84, 3.6, H - 0.24, -5.3, wallMat);
  addBox(0.26, 2.27, 0.08, 3.6, 1.135, -6.18, trimWoodMat);
  addBox(0.26, 2.27, 0.08, 3.6, 1.135, -4.42, trimWoodMat);

  // --- Living Room Furniture ---
  // Sofa facing West/North-West (-Z)
  const sofaGroup = new THREE.Group();
  sofaGroup.position.set(-0.3, 0, -4.85);
  addBox(1.95, 0.36, 0.78, 0, 0.22, 0, sofaMat, sofaGroup); // Base
  addBox(1.95, 0.58, 0.2, 0, 0.62, 0.29, sofaMat, sofaGroup); // Backrest
  addBox(0.2, 0.5, 0.78, -0.88, 0.42, 0, sofaMat, sofaGroup); // Left arm
  addBox(0.2, 0.5, 0.78, 0.88, 0.42, 0, sofaMat, sofaGroup); // Right arm
  addBox(0.84, 0.14, 0.56, -0.44, 0.46, -0.05, cushionMat, sofaGroup);
  addBox(0.84, 0.14, 0.56, 0.44, 0.46, -0.05, cushionMat, sofaGroup);
  scene.add(sofaGroup);

  // Coffee table North of sofa
  addBox(1.35, 0.06, 0.62, -0.3, 0.42, -5.62, darkWoodMat);
  addBox(0.06, 0.4, 0.06, -0.9, 0.2, -5.88, trimWoodMat);
  addBox(0.06, 0.4, 0.06, 0.3, 0.2, -5.88, trimWoodMat);
  addBox(0.06, 0.4, 0.06, -0.9, 0.2, -5.36, trimWoodMat);
  addBox(0.06, 0.4, 0.06, 0.3, 0.2, -5.36, trimWoodMat);

  // Standing warm floor lamp beside sofa
  const floorLamp = new THREE.Group();
  floorLamp.position.set(-1.55, 0, -4.75);
  const poleMesh = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.025, 0.03, 1.68, 12)),
    brassMat
  );
  poleMesh.position.y = 0.84;
  floorLamp.add(poleMesh);
  const baseMesh = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 16)),
    trimWoodMat
  );
  baseMesh.position.y = 0.02;
  floorLamp.add(baseMesh);
  const shadeMesh = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.16, 0.26, 0.32, 18)),
    lampShadeMat
  );
  shadeMesh.position.y = 1.66;
  floorLamp.add(shadeMesh);
  scene.add(floorLamp);

  // NE corner bookshelf
  addBox(1.0, 1.95, 0.46, 2.9, 0.975, -7.45, darkWoodMat);

  // --- Anomaly 01: Wall Clock at (-2.4, 1.62, -7.76) ---
  const clockGroup = new THREE.Group();
  clockGroup.position.set(-2.4, 1.62, -7.75);
  const clockCase = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.07, 24)),
    trimWoodMat
  );
  clockCase.rotation.x = Math.PI / 2;
  clockGroup.add(clockCase);
  const clockFace = new THREE.Mesh(
    trackGeo(new THREE.CircleGeometry(0.21, 24)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: clockTex,
        emissive: 0xffd7a8,
        emissiveMap: clockTex,
        emissiveIntensity: 0.22,
        roughness: 0.4,
      })
    )
  );
  clockFace.position.z = 0.038;
  clockGroup.add(clockFace);
  // Stuttering second hand pivot
  const clockSecPivot = new THREE.Group();
  clockSecPivot.position.set(0, 0, 0.045);
  const secHand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.01, 0.16, 0.008)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xb91c1c,
        emissive: 0x7f1d1d,
        emissiveIntensity: 0.4,
      })
    )
  );
  secHand.position.y = 0.065;
  clockSecPivot.add(secHand);
  clockGroup.add(clockSecPivot);
  scene.add(clockGroup);

  // --- Anomaly 02: West Credenza & Framed Photograph (-3.36, 1.12, -4.75) ---
  addBox(0.58, 0.8, 1.6, -3.4, 0.4, -4.75, darkWoodMat);
  const photoGroup = new THREE.Group();
  photoGroup.position.set(-3.36, 1.08, -4.75);
  photoGroup.rotation.y = Math.PI / 2;
  addBox(0.36, 0.44, 0.04, 0, 0, 0, trimWoodMat, photoGroup);
  const photoFront = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.3, 0.38)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: photoTex,
        emissive: 0xffffff,
        emissiveMap: photoTex,
        emissiveIntensity: 0.38,
        roughness: 0.35,
      })
    )
  );
  photoFront.position.z = 0.023;
  photoGroup.add(photoFront);
  scene.add(photoGroup);

  // --- Anomaly 03: Unplugged Ringing Telephone on East Table (2.48, 0.92, -3.40) ---
  addBox(0.75, 0.76, 0.75, 2.48, 0.38, -3.4, darkWoodMat);
  const phoneGroup = new THREE.Group();
  phoneGroup.position.set(2.48, 0.77, -3.4);
  addBox(0.24, 0.09, 0.22, 0, 0.045, 0, blackPlasticMat, phoneGroup); // Base
  const phoneHandset = new THREE.Group();
  phoneHandset.position.set(0, 0.125, 0);
  addBox(0.3, 0.045, 0.065, 0, 0, 0, blackPlasticMat, phoneHandset);
  phoneGroup.add(phoneHandset);
  // Subtle red indicator light on telephone
  const phoneLedMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 1.2,
    })
  );
  addBox(0.03, 0.015, 0.02, 0.07, 0.092, 0.07, phoneLedMat, phoneGroup);
  // Detached unplugged line dangling off edge with bare RJ11 end
  addBox(0.016, 0.016, 0.28, -0.06, 0.01, -0.22, blackPlasticMat, phoneGroup);
  addBox(0.016, 0.35, 0.016, -0.06, -0.17, -0.36, blackPlasticMat, phoneGroup);
  addBox(0.03, 0.035, 0.03, -0.06, -0.36, -0.36, brassMat, phoneGroup);
  scene.add(phoneGroup);

  // --- Small Study Walls (x [3.6, 7.0], z [-7.6, -2.6]) ---
  addBox(3.6, H, 0.2, 5.3, H / 2, -2.5, wallMat); // South
  addBox(0.2, H, 5.2, 7.1, H / 2, -5.1, wallMat); // East
  // North Study wall split around Interior Door (x in [4.65, 5.65], y in [0, 2.25])
  addBox(1.15, H, 0.22, 4.08, H / 2, -7.7, wallMat);
  addBox(1.48, H, 0.22, 6.4, H / 2, -7.7, wallMat);
  addBox(1.06, 0.5, 0.22, 5.15, H - 0.25, -7.7, wallMat);
  addBox(0.08, 2.26, 0.26, 4.63, 1.13, -7.68, trimWoodMat);
  addBox(0.08, 2.26, 0.26, 5.67, 1.13, -7.68, trimWoodMat);
  addBox(1.12, 0.08, 0.26, 5.15, 2.27, -7.68, trimWoodMat);

  // --- Hidden Cold Facility Corridor Glimpse Behind Study Interior Door ---
  const facilityGlimpseWallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x162432,
      roughness: 0.72,
      metalness: 0.16,
    })
  );
  const facilityCyanStripMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.8,
    })
  );
  addBox(1.9, 0.1, 3.0, 5.15, -0.05, -9.2, facilityGlimpseWallMat);
  addBox(1.9, H, 0.15, 5.15, H / 2, -10.6, facilityGlimpseWallMat);
  addBox(0.15, H, 3.0, 4.2, H / 2, -9.2, facilityGlimpseWallMat);
  addBox(0.15, H, 3.0, 6.1, H / 2, -9.2, facilityGlimpseWallMat);
  addBox(0.7, 0.08, 2.2, 5.15, H - 0.18, -9.2, facilityCyanStripMat);
  const corridorColdLight = new THREE.PointLight(0x60a5fa, 0, 7.0, 1.6);
  corridorColdLight.position.set(5.15, 2.15, -8.8);
  scene.add(corridorColdLight);

  // Hinged Interior Door (pivoted at x=4.65, z=-7.65)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(4.65, 0, -7.65);
  addBox(0.96, 2.22, 0.08, 0.5, 1.11, 0, darkWoodMat, doorPivot);
  addBox(0.05, 0.05, 0.14, 0.88, 1.05, 0.02, brassMat, doorPivot); // Doorknob
  scene.add(doorPivot);

  // --- Small Study Desk + Desk Lamp + Old Analog Recording Device ---
  addBox(1.05, 0.76, 1.85, 6.15, 0.38, -4.7, darkWoodMat);
  // Warm desk lamp on north edge of desk
  const deskLamp = new THREE.Group();
  deskLamp.position.set(6.25, 0.77, -3.98);
  addBox(0.16, 0.04, 0.16, 0, 0.02, 0, brassMat, deskLamp);
  addBox(0.03, 0.32, 0.03, 0, 0.18, 0, brassMat, deskLamp);
  const deskShade = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.16, 0.18, 16)),
    lampShadeMat
  );
  deskShade.position.set(-0.04, 0.35, 0);
  deskGroupRotate(deskLamp, deskShade);
  scene.add(deskLamp);

  // Analog Reel-to-Reel Tape Recorder at (5.95, 0.85, -4.7)
  const recorderGroup = new THREE.Group();
  recorderGroup.position.set(5.95, 0.77, -4.7);
  addBox(0.36, 0.12, 0.46, 0, 0.06, 0, blackPlasticMat, recorderGroup);
  const reelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.42,
      metalness: 0.24,
    })
  );
  const reel1 = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16)),
    reelMat
  );
  reel1.position.set(0, 0.13, -0.11);
  recorderGroup.add(reel1);
  const reel2 = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16)),
    reelMat
  );
  reel2.position.set(0, 0.13, 0.11);
  recorderGroup.add(reel2);
  scene.add(recorderGroup);

  // --- Observer Mode Fragmentation Geometry (subtle suspended spatial shards/seams) ---
  const fragmentGroup = new THREE.Group();
  fragmentGroup.visible = false;
  const fragmentMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.36,
      roughness: 0.25,
      depthWrite: false,
    })
  );
  const shardCoords: [number, number, number, number, number, number][] = [
    [0.06, 1.9, 0.06, 4.64, 1.2, -7.52],
    [0.06, 1.6, 0.06, 5.66, 1.15, -7.52],
    [0.92, 0.04, 0.06, 5.15, 2.28, -7.52],
    [0.08, 0.75, 0.08, 3.55, 1.45, -6.18],
    [0.08, 0.55, 0.08, -2.4, 2.25, -7.65],
    [0.12, 0.42, 0.08, 2.1, 1.85, -3.5],
  ];
  const shardMeshes: THREE.Mesh[] = [];
  for (const [w, h, d, sx, sy, sz] of shardCoords) {
    const m = addBox(w, h, d, sx, sy, sz, fragmentMat, fragmentGroup);
    shardMeshes.push(m);
  }
  scene.add(fragmentGroup);

  // --- Observer Mode Human Memory Echo (restrained translucent silhouette) ---
  const echoGroup = new THREE.Group();
  echoGroup.visible = false;
  const echoMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      emissive: 0x93c5fd,
      emissiveIntensity: 0.42,
      transparent: true,
      opacity: 0.32,
      roughness: 0.35,
      depthWrite: false,
    })
  );
  const echoHead = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.115, 16, 12)),
    echoMat
  );
  echoHead.position.y = 1.62;
  echoGroup.add(echoHead);

  const echoTorso = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.18, 0.14, 0.62, 14)),
    echoMat
  );
  echoTorso.position.y = 1.16;
  echoGroup.add(echoTorso);

  const echoLegs = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.13, 0.11, 0.84, 12)),
    echoMat
  );
  echoLegs.position.y = 0.42;
  echoGroup.add(echoLegs);

  const echoRightArmPivot = new THREE.Group();
  echoRightArmPivot.position.set(0.22, 1.38, 0);
  const echoRightArm = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.045, 0.04, 0.52, 10)),
    echoMat
  );
  echoRightArm.position.y = -0.22;
  echoRightArmPivot.add(echoRightArm);
  // Subtle cup held in Cycle 1 — vanishes in Cycle 2+!
  const echoCup = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.045, 0.038, 0.09, 12)),
    echoMat
  );
  echoCup.position.set(0, -0.46, 0.06);
  echoRightArmPivot.add(echoCup);
  echoGroup.add(echoRightArmPivot);

  const echoLeftArm = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.045, 0.04, 0.52, 10)),
    echoMat
  );
  echoLeftArm.position.set(-0.22, 1.16, 0);
  echoGroup.add(echoLeftArm);
  scene.add(echoGroup);

  let currentLocale = initialLocale;
  let currentPhotoChanged = false;

  const refreshPhoto = (locale: Locale, changed: boolean) => {
    currentLocale = locale;
    currentPhotoChanged = changed;
    drawPhotoCanvas(photoCtx, locale, changed);
    photoTex.needsUpdate = true;
  };

  return {
    scene,
    flashlight,
    flashlightTarget,
    updateLocaleTextures: (locale, photoChanged) => {
      refreshPhoto(locale, photoChanged);
    },
    setPhotoChanged: (changed) => {
      if (changed !== currentPhotoChanged) {
        refreshPhoto(currentLocale, changed);
      }
    },
    stepVisuals: (session, elapsed, dt, flashlightOn) => {
      // 1. Continuous gentle rain streaks scrolling down North window
      rainTex.offset.y = (rainTex.offset.y - dt * 0.42) % 1;

      // 2. Clock second hand unnatural 3-tick loop (ticks 3s forward then snaps back)
      const clockPhase = (elapsed * 1.45) % 3;
      const tickStep = Math.floor(clockPhase);
      clockSecPivot.rotation.z = -(tickStep * (Math.PI / 30));

      // 3. Ringing unplugged telephone subtle vibration + red indicator pulse until recorded
      const phoneStillRinging =
        !session.discoveredAnomalies.includes('impossible_call');
      if (phoneStillRinging) {
        const ringBurst = Math.sin(elapsed * 2.2) > 0.1;
        phoneHandset.position.y = ringBurst
          ? 0.125 + Math.abs(Math.sin(elapsed * 42)) * 0.008
          : 0.125;
        phoneHandset.rotation.z = ringBurst
          ? Math.sin(elapsed * 48) * 0.035
          : 0;
        phoneLedMat.emissiveIntensity = ringBurst ? 1.8 : 0.45;
      } else {
        phoneHandset.position.y = 0.125;
        phoneHandset.rotation.z = 0;
        phoneLedMat.emissiveIntensity = 0.25;
      }

      // 4. Analog recorder reels slow turn
      reel1.rotation.y += dt * 1.1;
      reel2.rotation.y += dt * 1.1;

      // 5. Photograph state sync
      if (session.photoChanged !== currentPhotoChanged) {
        refreshPhoto(currentLocale, session.photoChanged);
      }

      // 6. Observer Mode visuals + Echo Cycle animation + Collapse distortion
      const isObserverOrCollapse =
        session.stage === 'observer' ||
        session.stage === 'observer_transition' ||
        session.stage === 'collapse';

      fragmentGroup.visible = isObserverOrCollapse;

      if (session.stage === 'observer' || session.stage === 'observer_transition') {
        echoGroup.visible = true;
        const cycleProgress = Math.min(1, session.echoTimer / 4.2);

        if (!session.echoChangedDetail) {
          // Cycle 1: Ordinary household pacing from coffee table toward rain window
          echoGroup.position.set(
            0.2 + Math.sin(cycleProgress * Math.PI) * 0.65,
            0,
            -6.35 - Math.sin(cycleProgress * Math.PI) * 0.35
          );
          echoGroup.rotation.y = Math.PI + Math.sin(cycleProgress * Math.PI) * 0.4;
          echoRightArmPivot.rotation.x = -0.35 - Math.sin(cycleProgress * Math.PI) * 0.35;
          echoCup.visible = true;
        } else {
          // Cycle 2+: Echo detail shifts — cup disappears and echo turns/gestures toward Study door!
          echoGroup.position.set(
            1.65 + Math.sin(cycleProgress * Math.PI) * 0.45,
            0,
            -6.05
          );
          echoGroup.rotation.y = Math.PI * 0.38; // Faces East/North-East directly toward Study doorway
          echoRightArmPivot.rotation.x = -0.78;
          echoCup.visible = false;
        }

        const fadeInAlpha =
          session.stage === 'observer_transition'
            ? Math.min(1, session.observerTransitionTimer / 1.1)
            : 1;
        echoMat.opacity = 0.3 * fadeInAlpha;
      } else {
        echoGroup.visible = false;
      }

      // 7. Interior Study door crack & cold facility corridor light
      if (session.stage === 'collapse') {
        const cRatio = Math.min(1, session.collapseTimer / 2.95);
        doorPivot.rotation.y = 0.16 + cRatio * 0.44;
        corridorColdLight.intensity = 3.2 + cRatio * 3.5;

        // Restrained inconsistent lighting dip (NO intense high-frequency strobe flashing)
        const dip = 0.55 + Math.sin(elapsed * 4.5) * 0.25;
        hallLight.intensity = 3.2 * dip;
        livingLight.intensity = 5.4 * (0.45 + Math.cos(elapsed * 3.8) * 0.25);
        studyLight.intensity = 3.8 * (0.35 + (1 - cRatio) * 0.35);
        windowNightLight.intensity = 2.8;

        // Localized subtle architectural shift around Study doorway shards
        fragmentMat.opacity = 0.52 + cRatio * 0.28;
        shardMeshes.forEach((m, idx) => {
          m.position.y += Math.sin(elapsed * 3.0 + idx) * dt * 0.06;
        });
      } else if (session.discrepancyInteractableReady) {
        // Spatial discrepancy cracked slightly open
        doorPivot.rotation.y = 0.16;
        corridorColdLight.intensity = 2.6;
        hallLight.intensity = 3.0;
        livingLight.intensity = 5.0;
        studyLight.intensity = 3.4;
        fragmentMat.opacity = 0.42;
      } else {
        doorPivot.rotation.y = 0;
        corridorColdLight.intensity = 0;
        hallLight.intensity = 3.2;
        livingLight.intensity = 5.4;
        studyLight.intensity = 3.8;
      }

      flashlight.intensity = flashlightOn ? 8.5 : 0;
    },
    dispose: () => {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
      scene.clear();
    },
  };
}

function deskGroupRotate(parent: THREE.Group, shade: THREE.Mesh): void {
  shade.rotation.z = 0.35;
  parent.add(shade);
}
