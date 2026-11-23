import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LOCALE_STORAGE_KEY,
  StorageLike,
  detectInitialLocale,
  saveLocalePreference,
  translateKey,
} from './localeStorage';
import {
  arTranslations,
  enTranslations,
  translations,
} from './translations';

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => {
      map.set(k, v);
    },
  };
}

test('English and Arabic dictionaries share identical required translation keys with non-empty values', () => {
  const enKeys = Object.keys(enTranslations).sort();
  const arKeys = Object.keys(arTranslations).sort();

  assert.deepEqual(
    arKeys,
    enKeys,
    'Arabic and English dictionaries must contain the exact same set of keys'
  );

  for (const key of enKeys) {
    const enVal = enTranslations[key as keyof typeof enTranslations];
    const arVal = arTranslations[key as keyof typeof arTranslations];
    assert.ok(enVal.trim().length > 0, `Empty EN string for key: ${key}`);
    assert.ok(arVal.trim().length > 0, `Empty AR string for key: ${key}`);
  }
});

test('glossary invariants are preserved across both locales', () => {
  assert.equal(arTranslations['title.gameTitle'], 'THE SILENCE');
  assert.equal(arTranslations['title.project'], 'PROJECT RECALL');
  assert.equal(arTranslations['terminal.project'], 'PROJECT RECALL');
  assert.equal(arTranslations['terminal.program'], 'برنامج استعادة الذاكرة');
  assert.equal(arTranslations['terminal.subject'], 'SUBJECT 047');
  assert.equal(
    arTranslations['terminal.cognitiveResponse'],
    'الاستجابة الإدراكية: تم رصدها'
  );
  assert.equal(
    arTranslations['terminal.identityStatus'],
    'حالة الهوية: غير معروفة'
  );
  assert.equal(
    arTranslations['terminal.recoverySession'],
    'جلسة استعادة الذاكرة: فشلت'
  );
  assert.ok(
    arTranslations['record.classification'].includes('سجل الأبحاث المؤرشف')
  );
  assert.ok(arTranslations['record.title'].includes('SUBJECT 012'));
});

test('translateKey safely falls back to English when an Arabic key is missing', () => {
  const partialDicts = {
    en: { ...translations.en, 'custom.onlyEn': 'Fallback English Value' },
    ar: { ...translations.ar },
  };
  assert.equal(
    translateKey('ar', 'custom.onlyEn', partialDicts),
    'Fallback English Value'
  );
  assert.equal(
    translateKey('ar', 'nonexistent.key', partialDicts),
    'nonexistent.key'
  );
});

test('browser detection uses Arabic only when primary locale is Arabic, and saved preference overrides browser locale', () => {
  // Primary Arabic browser locale -> "ar"
  assert.equal(
    detectInitialLocale({
      storage: createMemoryStorage(),
      languages: ['ar-SA', 'en-US'],
    }),
    'ar'
  );
  assert.equal(
    detectInitialLocale({
      storage: createMemoryStorage(),
      language: 'ar',
    }),
    'ar'
  );

  // Secondary Arabic does NOT override non-Arabic primary
  assert.equal(
    detectInitialLocale({
      storage: createMemoryStorage(),
      languages: ['en-US', 'ar-SA'],
    }),
    'en'
  );

  // Saved localStorage preference overrides browser locale
  const storageEn = createMemoryStorage({ [LOCALE_STORAGE_KEY]: 'en' });
  assert.equal(
    detectInitialLocale({
      storage: storageEn,
      languages: ['ar-EG'],
    }),
    'en'
  );

  const storageAr = createMemoryStorage();
  saveLocalePreference('ar', storageAr);
  assert.equal(
    detectInitialLocale({
      storage: storageAr,
      languages: ['en-US'],
    }),
    'ar'
  );
});

test('Milestone 03 console, journal, and security terminology are properly localized', () => {
  assert.equal(enTranslations['memoryConsole.project'], 'PROJECT RECALL');
  assert.equal(enTranslations['memoryConsole.system'], 'MEMORY ANALYSIS SYSTEM');
  assert.equal(enTranslations['memoryConsole.subject'], 'SUBJECT: 047');
  assert.equal(enTranslations['memoryConsole.memoryData'], 'MEMORY DATA: AVAILABLE');
  assert.equal(
    enTranslations['memoryConsole.reconstructionStatus'],
    'RECONSTRUCTION STATUS: INCOMPLETE'
  );
  assert.equal(
    enTranslations['memoryConsole.previousSession'],
    'PREVIOUS SESSION: TERMINATED'
  );

  assert.equal(arTranslations['memoryConsole.project'], 'PROJECT RECALL');
  assert.equal(arTranslations['memoryConsole.subject'], 'SUBJECT: 047');
  assert.equal(arTranslations['zone.memoryWing'], 'جناح تحليل الذاكرة');
  assert.equal(arTranslations['journal.title'], 'مفكرة الأبحاث');
});

test('Milestone 04 memory reconstruction, Observer Mode, and collapse subtitles preserve invariants', () => {
  assert.equal(enTranslations['memory.modeObserver'], 'OBSERVER MODE');
  assert.equal(arTranslations['memory.modeObserver'], 'وضع المراقب');
  assert.equal(enTranslations['memory.objExploreTitle'], 'EXPLORE THE MEMORY');
  assert.equal(
    enTranslations['memory.msg.collapseSubtitle'],
    'That memory was never supposed to exist.'
  );
  assert.equal(
    arTranslations['memory.msg.collapseSubtitle'],
    'لم يكن من المفترض أن توجد تلك الذكرى.'
  );
  assert.equal(enTranslations['memoryConsole.fragmentLine'], 'FRAGMENT: 01');
  assert.equal(arTranslations['memoryConsole.fragmentLine'], 'FRAGMENT: 01');
  assert.equal(
    enTranslations['memoryConsole.statusInterruptedLine'],
    'RECONSTRUCTION STATUS: INTERRUPTED'
  );
  assert.equal(
    enTranslations['memoryConsole.unexpectedDataLine'],
    'UNEXPECTED DATA: DETECTED'
  );
});

