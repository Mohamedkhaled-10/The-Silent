import * as THREE from 'three';
import { Locale, translateKey } from '../i18n';

export interface LocalizedTextures {
  terminalScreenMap: THREE.CanvasTexture;
  eegScreenMap: THREE.CanvasTexture;
  dossierPaperMap: THREE.CanvasTexture;
  accessCardMap: THREE.CanvasTexture;
  doorPlaqueLockedMap: THREE.CanvasTexture;
  doorPlaqueUnlockedMap: THREE.CanvasTexture;
  memoryConsoleMap: THREE.CanvasTexture;
  neuralScanMap: THREE.CanvasTexture;
  sessionReportMap: THREE.CanvasTexture;
  dispose: () => void;
}

export interface FacilityTextures extends LocalizedTextures {
  wallMap: THREE.CanvasTexture;
  wallBump: THREE.CanvasTexture;
  floorMap: THREE.CanvasTexture;
  floorBump: THREE.CanvasTexture;
  ceilingMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
}

function makeCanvas(
  width: number,
  height: number
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function configureTexture(
  canvas: HTMLCanvasElement,
  isColor: boolean,
  anisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Wraps embedded Latin identifiers in Unicode Left-to-Right Isolate (\u2066...\u2069)
 * so mixed Arabic + English strings render cleanly on RTL canvas contexts.
 */
function isolateLtrTokens(text: string): string {
  return text.replace(
    /([A-Za-z0-9]+(?:[\s\-_/]+[A-Za-z0-9]+)*)/g,
    '\u2066$1\u2069'
  );
}

/**
 * Wraps text across multiple lines respecting word boundaries for both LTR and RTL.
 */
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
}

export function createLocalizedTextures(
  locale: Locale,
  maxAnisotropy: number
): LocalizedTextures {
  const aniso = Math.min(Math.max(1, maxAnisotropy), 4);
  const isRtl = locale === 'ar';
  const fontFamily = isRtl
    ? '"Cairo", "Tahoma", "Arial", sans-serif'
    : 'monospace';

  const formatText = (raw: string): string =>
    isRtl ? isolateLtrTokens(raw) : raw;

  const drawWrapped = (
    ctx: CanvasRenderingContext2D,
    raw: string,
    x: number,
    startY: number,
    maxWidth: number,
    lineHeight: number
  ): number => {
    const lines = wrapCanvasText(ctx, formatText(raw), maxWidth);
    let y = startY;
    for (const line of lines) {
      ctx.fillText(line, x, y);
      y += lineHeight;
    }
    return y;
  };

  // 1. Primary Research Terminal Screen Texture
  const [termCanvas, tCtx] = makeCanvas(512, 320);
  tCtx.fillStyle = '#05131c';
  tCtx.fillRect(0, 0, 512, 320);
  tCtx.strokeStyle = 'rgba(72, 168, 214, 0.12)';
  tCtx.lineWidth = 1;
  for (let y = 0; y < 320; y += 16) {
    tCtx.beginPath();
    tCtx.moveTo(0, y);
    tCtx.lineTo(512, y);
    tCtx.stroke();
  }
  tCtx.strokeStyle = '#38bdf8';
  tCtx.lineWidth = 2;
  tCtx.strokeRect(16, 16, 480, 288);

  tCtx.direction = isRtl ? 'rtl' : 'ltr';
  tCtx.textAlign = isRtl ? 'right' : 'left';
  const termX = isRtl ? 478 : 34;
  const termMaxW = 444;

  tCtx.fillStyle = '#7dd3fc';
  tCtx.font = isRtl ? `700 22px ${fontFamily}` : `bold 24px ${fontFamily}`;
  tCtx.fillText(
    formatText(translateKey(locale, 'terminal.project')),
    termX,
    56
  );

  tCtx.fillStyle = '#94a3b8';
  tCtx.font = isRtl ? `500 16px ${fontFamily}` : `15px ${fontFamily}`;
  tCtx.fillText(
    formatText(translateKey(locale, 'terminal.program')),
    termX,
    84
  );

  tCtx.fillStyle = '#e2e8f0';
  tCtx.font = isRtl ? `700 18px ${fontFamily}` : `bold 18px ${fontFamily}`;
  tCtx.fillText(
    formatText(translateKey(locale, 'terminal.subject')),
    termX,
    126
  );

  tCtx.fillStyle = '#38bdf8';
  tCtx.font = isRtl ? `500 16px ${fontFamily}` : `15px ${fontFamily}`;
  let termY = drawWrapped(
    tCtx,
    translateKey(locale, 'terminal.cognitiveResponse'),
    termX,
    164,
    termMaxW,
    24
  );

  tCtx.fillStyle = '#cbd5e1';
  termY = drawWrapped(
    tCtx,
    translateKey(locale, 'terminal.identityStatus'),
    termX,
    termY + 6,
    termMaxW,
    24
  );

  tCtx.fillStyle = '#f87171';
  drawWrapped(
    tCtx,
    translateKey(locale, 'terminal.recoverySession'),
    termX,
    termY + 6,
    termMaxW,
    24
  );

  tCtx.fillStyle = '#38bdf8';
  tCtx.font = isRtl ? `500 14px ${fontFamily}` : `13px ${fontFamily}`;
  tCtx.fillText(
    formatText(translateKey(locale, 'canvas.terminalPrompt')),
    termX,
    274
  );

  // 2. Auxiliary EEG Waveform Screen Texture
  const [eegCanvas, eCtx] = makeCanvas(256, 160);
  eCtx.fillStyle = '#041018';
  eCtx.fillRect(0, 0, 256, 160);
  eCtx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
  for (let x = 0; x < 256; x += 24) {
    eCtx.beginPath();
    eCtx.moveTo(x, 0);
    eCtx.lineTo(x, 160);
    eCtx.stroke();
  }
  eCtx.strokeStyle = '#38bdf8';
  eCtx.lineWidth = 2;
  eCtx.beginPath();
  for (let x = 8; x < 248; x += 4) {
    const spike =
      x % 48 === 0
        ? -28
        : x % 24 === 0
          ? 18
          : Math.sin(x * 0.25) * 6;
    const y = 84 + spike;
    if (x === 8) eCtx.moveTo(x, y);
    else eCtx.lineTo(x, y);
  }
  eCtx.stroke();

  eCtx.direction = isRtl ? 'rtl' : 'ltr';
  eCtx.textAlign = isRtl ? 'right' : 'left';
  eCtx.fillStyle = '#7dd3fc';
  eCtx.font = isRtl ? `600 12px ${fontFamily}` : `11px ${fontFamily}`;
  eCtx.fillText(
    formatText(translateKey(locale, 'canvas.eegHeader')),
    isRtl ? 242 : 12,
    24
  );

  // 3. Archived Dossier Paper Texture (SUBJECT 012)
  const [docCanvas, dCtx] = makeCanvas(256, 320);
  dCtx.fillStyle = '#d4d8dc';
  dCtx.fillRect(0, 0, 256, 320);
  dCtx.strokeStyle = '#475569';
  dCtx.lineWidth = 2;
  dCtx.strokeRect(12, 12, 232, 296);

  dCtx.direction = isRtl ? 'rtl' : 'ltr';
  dCtx.textAlign = isRtl ? 'right' : 'left';
  const docX = isRtl ? 230 : 24;
  const docMaxW = 204;

  dCtx.fillStyle = '#0f172a';
  dCtx.font = isRtl ? `700 14px ${fontFamily}` : `bold 14px ${fontFamily}`;
  const afterHeaderY = drawWrapped(
    dCtx,
    translateKey(locale, 'canvas.dossierHeader'),
    docX,
    40,
    docMaxW,
    20
  );

  dCtx.font = isRtl ? `700 15px ${fontFamily}` : `bold 15px ${fontFamily}`;
  dCtx.fillText(
    formatText(translateKey(locale, 'canvas.dossierSubject')),
    docX,
    afterHeaderY + 10
  );

  dCtx.fillStyle = '#334155';
  for (let y = afterHeaderY + 34; y < 218; y += 18) {
    const barW = 188 - ((y * 7) % 45);
    const barX = isRtl ? docX - barW : docX;
    dCtx.fillRect(barX, y, barW, 6);
  }

  dCtx.strokeStyle = '#b91c1c';
  dCtx.lineWidth = 3;
  const stampX = isRtl ? 78 : 28;
  dCtx.strokeRect(stampX, 240, 150, 36);
  dCtx.fillStyle = '#b91c1c';
  dCtx.direction = isRtl ? 'rtl' : 'ltr';
  dCtx.textAlign = 'center';
  dCtx.font = isRtl ? `700 17px ${fontFamily}` : `bold 16px ${fontFamily}`;
  dCtx.fillText(
    formatText(translateKey(locale, 'canvas.dossierStamp')),
    stampX + 75,
    264
  );

  // 4. Security Access Card Face Texture
  const [cardCanvas, cCtx] = makeCanvas(256, 160);
  cCtx.fillStyle = '#0e1b29';
  cCtx.fillRect(0, 0, 256, 160);
  cCtx.fillStyle = '#38bdf8';
  cCtx.fillRect(0, 0, 256, 22);
  cCtx.strokeStyle = '#7dd3fc';
  cCtx.lineWidth = 2;
  cCtx.strokeRect(8, 8, 240, 144);
  // Magnetic contact chip
  cCtx.fillStyle = '#eab308';
  cCtx.fillRect(20, 62, 34, 24);
  cCtx.strokeStyle = '#713f12';
  cCtx.lineWidth = 1;
  cCtx.strokeRect(20, 62, 34, 24);

  cCtx.direction = isRtl ? 'rtl' : 'ltr';
  cCtx.textAlign = isRtl ? 'right' : 'left';
  const cardTextX = isRtl ? 236 : 64;
  cCtx.fillStyle = '#e0f2fe';
  cCtx.font = isRtl ? `700 13px ${fontFamily}` : `bold 11px ${fontFamily}`;
  cCtx.fillText(
    formatText(translateKey(locale, 'canvas.cardHeader')),
    cardTextX,
    52
  );
  cCtx.fillStyle = '#38bdf8';
  cCtx.font = isRtl ? `700 15px ${fontFamily}` : `bold 12px ${fontFamily}`;
  drawWrapped(
    cCtx,
    translateKey(locale, 'canvas.cardTitle'),
    cardTextX,
    78,
    172,
    18
  );
  cCtx.fillStyle = '#94a3b8';
  cCtx.font = isRtl ? `600 12px ${fontFamily}` : `10px ${fontFamily}`;
  cCtx.fillText(
    formatText(translateKey(locale, 'canvas.cardClearance')),
    cardTextX,
    126
  );

  // 5 & 6. Security Bulkhead Reader Plaques (Locked & Unlocked)
  const buildDoorPlaque = (unlocked: boolean): THREE.CanvasTexture => {
    const [plaqueCanvas, pCtx] = makeCanvas(256, 128);
    pCtx.fillStyle = '#07111a';
    pCtx.fillRect(0, 0, 256, 128);
    pCtx.strokeStyle = unlocked ? '#34d399' : '#ef4444';
    pCtx.lineWidth = 3;
    pCtx.strokeRect(8, 8, 240, 112);

    pCtx.direction = isRtl ? 'rtl' : 'ltr';
    pCtx.textAlign = 'center';
    pCtx.fillStyle = '#cbd5e1';
    pCtx.font = isRtl ? `600 15px ${fontFamily}` : `bold 13px ${fontFamily}`;
    pCtx.fillText(
      formatText(translateKey(locale, 'canvas.doorLockedHeader')),
      128,
      46
    );

    pCtx.fillStyle = unlocked ? '#34d399' : '#f87171';
    pCtx.font = isRtl ? `700 19px ${fontFamily}` : `bold 16px ${fontFamily}`;
    pCtx.fillText(
      formatText(
        translateKey(
          locale,
          unlocked ? 'canvas.doorUnlockedStatus' : 'canvas.doorLockedStatus'
        )
      ),
      128,
      86
    );
    return configureTexture(plaqueCanvas, true, aniso, 1, 1);
  };

  // 7. Central Memory Analysis Console Display Texture
  const [mcCanvas, mCtx] = makeCanvas(512, 320);
  mCtx.fillStyle = '#04121c';
  mCtx.fillRect(0, 0, 512, 320);
  mCtx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
  for (let y = 0; y < 320; y += 16) {
    mCtx.beginPath();
    mCtx.moveTo(0, y);
    mCtx.lineTo(512, y);
    mCtx.stroke();
  }
  mCtx.strokeStyle = '#38bdf8';
  mCtx.lineWidth = 3;
  mCtx.strokeRect(16, 16, 480, 288);

  mCtx.direction = isRtl ? 'rtl' : 'ltr';
  mCtx.textAlign = isRtl ? 'right' : 'left';
  const mcX = isRtl ? 476 : 36;
  const mcMaxW = 440;

  mCtx.fillStyle = '#7dd3fc';
  mCtx.font = isRtl ? `700 22px ${fontFamily}` : `bold 24px ${fontFamily}`;
  mCtx.fillText(
    formatText(translateKey(locale, 'memoryConsole.project')),
    mcX,
    58
  );

  mCtx.fillStyle = '#38bdf8';
  mCtx.font = isRtl ? `600 18px ${fontFamily}` : `bold 17px ${fontFamily}`;
  mCtx.fillText(
    formatText(translateKey(locale, 'canvas.memoryConsoleTitle')),
    mcX,
    92
  );

  mCtx.fillStyle = '#e2e8f0';
  mCtx.font = isRtl ? `600 16px ${fontFamily}` : `15px ${fontFamily}`;
  let mcY = drawWrapped(
    mCtx,
    translateKey(locale, 'canvas.memoryConsoleSub'),
    mcX,
    136,
    mcMaxW,
    24
  );

  mCtx.fillStyle = '#f87171';
  mCtx.font = isRtl ? `600 15px ${fontFamily}` : `14px ${fontFamily}`;
  mcY = drawWrapped(
    mCtx,
    translateKey(locale, 'memoryConsole.reconstructionStatus'),
    mcX,
    mcY + 8,
    mcMaxW,
    22
  );

  mCtx.fillStyle = '#f87171';
  drawWrapped(
    mCtx,
    translateKey(locale, 'memoryConsole.previousSession'),
    mcX,
    mcY + 4,
    mcMaxW,
    22
  );

  mCtx.fillStyle = '#38bdf8';
  mCtx.font = isRtl ? `600 15px ${fontFamily}` : `14px ${fontFamily}`;
  mCtx.fillText(
    formatText(translateKey(locale, 'canvas.memoryConsolePrompt')),
    mcX,
    274
  );

  // 8. Neural Scan Monitor Screen Texture
  const [nsCanvas, nCtx] = makeCanvas(256, 192);
  nCtx.fillStyle = '#04121b';
  nCtx.fillRect(0, 0, 256, 192);
  nCtx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  nCtx.lineWidth = 2;
  nCtx.beginPath();
  nCtx.arc(128, 108, 52, 0, Math.PI * 2);
  nCtx.stroke();
  nCtx.beginPath();
  nCtx.arc(128, 108, 32, 0, Math.PI * 2);
  nCtx.stroke();
  nCtx.strokeStyle = '#38bdf8';
  nCtx.beginPath();
  for (let x = 24; x <= 232; x += 6) {
    const amp = Math.sin(x * 0.14) * 14 + Math.cos(x * 0.35) * 6;
    const y = 108 + amp;
    if (x === 24) nCtx.moveTo(x, y);
    else nCtx.lineTo(x, y);
  }
  nCtx.stroke();
  nCtx.direction = isRtl ? 'rtl' : 'ltr';
  nCtx.textAlign = isRtl ? 'right' : 'left';
  nCtx.fillStyle = '#7dd3fc';
  nCtx.font = isRtl ? `600 13px ${fontFamily}` : `11px ${fontFamily}`;
  nCtx.fillText(
    formatText(translateKey(locale, 'canvas.neuralScanHeader')),
    isRtl ? 242 : 14,
    28
  );

  // 9. Session Report Paper Texture
  const [srCanvas, srCtx] = makeCanvas(256, 320);
  srCtx.fillStyle = '#cfd8e3';
  srCtx.fillRect(0, 0, 256, 320);
  srCtx.strokeStyle = '#334155';
  srCtx.lineWidth = 2;
  srCtx.strokeRect(12, 12, 232, 296);
  srCtx.direction = isRtl ? 'rtl' : 'ltr';
  srCtx.textAlign = isRtl ? 'right' : 'left';
  const srX = isRtl ? 230 : 24;
  srCtx.fillStyle = '#0f172a';
  srCtx.font = isRtl ? `700 15px ${fontFamily}` : `bold 13px ${fontFamily}`;
  const srAfterY = drawWrapped(
    srCtx,
    translateKey(locale, 'canvas.sessionReportHeader'),
    srX,
    42,
    204,
    20
  );
  srCtx.fillStyle = '#334155';
  for (let y = srAfterY + 24; y < 236; y += 18) {
    const barW = 180 - ((y * 11) % 42);
    const barX = isRtl ? srX - barW : srX;
    srCtx.fillRect(barX, y, barW, 6);
  }
  srCtx.fillStyle = '#b91c1c';
  srCtx.fillRect(isRtl ? 140 : 24, 252, 92, 18);

  const terminalScreenMap = configureTexture(termCanvas, true, aniso, 1, 1);
  const eegScreenMap = configureTexture(eegCanvas, true, aniso, 1, 1);
  const dossierPaperMap = configureTexture(docCanvas, true, aniso, 1, 1);
  const accessCardMap = configureTexture(cardCanvas, true, aniso, 1, 1);
  const doorPlaqueLockedMap = buildDoorPlaque(false);
  const doorPlaqueUnlockedMap = buildDoorPlaque(true);
  const memoryConsoleMap = configureTexture(mcCanvas, true, aniso, 1, 1);
  const neuralScanMap = configureTexture(nsCanvas, true, aniso, 1, 1);
  const sessionReportMap = configureTexture(srCanvas, true, aniso, 1, 1);

  return {
    terminalScreenMap,
    eegScreenMap,
    dossierPaperMap,
    accessCardMap,
    doorPlaqueLockedMap,
    doorPlaqueUnlockedMap,
    memoryConsoleMap,
    neuralScanMap,
    sessionReportMap,
    dispose: () => {
      terminalScreenMap.dispose();
      eegScreenMap.dispose();
      dossierPaperMap.dispose();
      accessCardMap.dispose();
      doorPlaqueLockedMap.dispose();
      doorPlaqueUnlockedMap.dispose();
      memoryConsoleMap.dispose();
      neuralScanMap.dispose();
      sessionReportMap.dispose();
    },
  };
}

export function createFacilityTextures(
  maxAnisotropy: number,
  locale: Locale = 'en'
): FacilityTextures {
  const aniso = Math.min(Math.max(1, maxAnisotropy), 4);

  // 1. Industrial / Medical Wall Panel Texture + Bump
  const [wallCanvas, wCtx] = makeCanvas(256, 256);
  wCtx.fillStyle = '#242d37';
  wCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1600; i++) {
    const x = (i * 73) % 256;
    const y = (i * 137) % 256;
    const shade = 30 + ((i * 19) % 18);
    wCtx.fillStyle = `rgb(${shade}, ${shade + 7}, ${shade + 15})`;
    wCtx.fillRect(x, y, 2, 2);
  }
  wCtx.strokeStyle = '#141a21';
  wCtx.lineWidth = 3;
  wCtx.strokeRect(2, 2, 252, 252);
  wCtx.beginPath();
  wCtx.moveTo(0, 128);
  wCtx.lineTo(256, 128);
  wCtx.stroke();
  wCtx.fillStyle = 'rgba(12, 18, 25, 0.28)';
  wCtx.fillRect(0, 180, 256, 76);

  const [wallBumpCanvas, wbCtx] = makeCanvas(256, 256);
  wbCtx.fillStyle = '#808080';
  wbCtx.fillRect(0, 0, 256, 256);
  wbCtx.strokeStyle = '#303030';
  wbCtx.lineWidth = 4;
  wbCtx.strokeRect(2, 2, 252, 252);
  wbCtx.beginPath();
  wbCtx.moveTo(0, 128);
  wbCtx.lineTo(256, 128);
  wbCtx.stroke();

  // 2. Floor Tile Texture + Bump
  const [floorCanvas, fCtx] = makeCanvas(256, 256);
  fCtx.fillStyle = '#182028';
  fCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64) {
    for (let x = 0; x < 256; x += 64) {
      const tone = (x / 64 + y / 64) % 2 === 0 ? '#1b242d' : '#161e26';
      fCtx.fillStyle = tone;
      fCtx.fillRect(x + 1, y + 1, 62, 62);
    }
  }
  fCtx.strokeStyle = '#0d1217';
  fCtx.lineWidth = 2;
  for (let i = 0; i <= 256; i += 64) {
    fCtx.beginPath();
    fCtx.moveTo(i, 0);
    fCtx.lineTo(i, 256);
    fCtx.stroke();
    fCtx.beginPath();
    fCtx.moveTo(0, i);
    fCtx.lineTo(256, i);
    fCtx.stroke();
  }

  const [floorBumpCanvas, fbCtx] = makeCanvas(256, 256);
  fbCtx.fillStyle = '#909090';
  fbCtx.fillRect(0, 0, 256, 256);
  fbCtx.strokeStyle = '#383838';
  fbCtx.lineWidth = 3;
  for (let i = 0; i <= 256; i += 64) {
    fbCtx.beginPath();
    fbCtx.moveTo(i, 0);
    fbCtx.lineTo(i, 256);
    fbCtx.stroke();
    fbCtx.beginPath();
    fbCtx.moveTo(0, i);
    fbCtx.lineTo(256, i);
    fbCtx.stroke();
  }

  // 3. Ceiling Technical Panel
  const [ceilCanvas, cCtx] = makeCanvas(256, 256);
  cCtx.fillStyle = '#121820';
  cCtx.fillRect(0, 0, 256, 256);
  cCtx.strokeStyle = '#0a0e13';
  cCtx.lineWidth = 4;
  cCtx.strokeRect(4, 4, 248, 248);
  cCtx.fillStyle = '#0b1016';
  for (let y = 40; y < 110; y += 12) {
    cCtx.fillRect(36, y, 184, 5);
  }

  // 4. Radial Contact Shadow Disc
  const [shadowCanvas, sCtx] = makeCanvas(128, 128);
  const grad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);

  const wallMap = configureTexture(wallCanvas, true, aniso, 2, 1);
  const wallBump = configureTexture(wallBumpCanvas, false, aniso, 2, 1);
  const floorMap = configureTexture(floorCanvas, true, aniso, 4, 4);
  const floorBump = configureTexture(floorBumpCanvas, false, aniso, 4, 4);
  const ceilingMap = configureTexture(ceilCanvas, true, aniso, 3, 3);
  const contactShadowMap = configureTexture(shadowCanvas, true, 1, 1, 1);
  contactShadowMap.wrapS = THREE.ClampToEdgeWrapping;
  contactShadowMap.wrapT = THREE.ClampToEdgeWrapping;

  const localized = createLocalizedTextures(locale, maxAnisotropy);

  return {
    wallMap,
    wallBump,
    floorMap,
    floorBump,
    ceilingMap,
    contactShadowMap,
    terminalScreenMap: localized.terminalScreenMap,
    eegScreenMap: localized.eegScreenMap,
    dossierPaperMap: localized.dossierPaperMap,
    accessCardMap: localized.accessCardMap,
    doorPlaqueLockedMap: localized.doorPlaqueLockedMap,
    doorPlaqueUnlockedMap: localized.doorPlaqueUnlockedMap,
    memoryConsoleMap: localized.memoryConsoleMap,
    neuralScanMap: localized.neuralScanMap,
    sessionReportMap: localized.sessionReportMap,
    dispose: () => {
      wallMap.dispose();
      wallBump.dispose();
      floorMap.dispose();
      floorBump.dispose();
      ceilingMap.dispose();
      contactShadowMap.dispose();
      localized.dispose();
    },
  };
}
