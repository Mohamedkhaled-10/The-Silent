export type Locale = 'en' | 'ar';

export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'ar'] as const;

export const enTranslations = {
  // Language Switcher
  'lang.label': 'LANGUAGE',
  'lang.en': 'EN',
  'lang.ar': 'العربية',
  'lang.toggleAria': 'Switch language to Arabic',

  // Title Screen
  'title.milestone': 'MILESTONE 04 // THE FIRST RECALL',
  'title.sector': 'FACILITY SECTOR B-04',
  'title.project': 'PROJECT RECALL',
  'title.gameTitle': 'THE SILENCE',
  'title.subtitle':
    'Subject 047 cognitive recovery sequence interrupted. Explore the sub-level research wing, recover facility records, and investigate the Memory Analysis Wing.',
  'title.startCta': 'INITIATE SESSION',

  // Control Hint Labels
  'controls.move': 'Move',
  'controls.look': 'Mouse Look',
  'controls.interact': 'Interact',
  'controls.flashlight': 'Flashlight',
  'controls.journal': 'Journal',
  'controls.pause': 'Pause',
  'controls.mute': 'Mute',
  'controls.keyMouse': 'Mouse',
  'controls.keyEsc': 'Esc',

  // Zones
  'zone.awakening': 'AWAKENING CHAMBER',
  'zone.corridor': 'RESEARCH CORRIDOR',
  'zone.observation': 'OBSERVATION ROOM',
  'zone.memoryWing': 'MEMORY ANALYSIS WING',

  // Objectives System
  'obj.panelLabel': 'ACTIVE OBJECTIVE',
  'obj.stepFormat': 'OBJECTIVE',
  'obj.completedToast': 'OBJECTIVE COMPLETED',
  'obj.allCompleteTitle': 'INVESTIGATION COMPLETE',
  'obj.allCompleteDesc':
    'Milestone 04 concluded — review Fragment 01 findings in your Research Journal [J] or continue exploring.',

  'obj.corridor.title': 'Reach the Research Corridor',
  'obj.corridor.desc':
    'Explore the Awakening Chamber and proceed into the Research Corridor.',
  'obj.observation.title': 'Investigate the Observation Room',
  'obj.observation.desc':
    'Follow the Research Corridor north into the Observation Room.',
  'obj.terminal.title': 'Access the Research Terminal',
  'obj.terminal.desc':
    'Activate and inspect the main Research Terminal in the Observation Room.',
  'obj.record.title': 'Inspect Archived Record [SUBJECT 012]',
  'obj.record.desc':
    'Locate and read the SUBJECT 012 archived research record on the side desk.',
  'obj.accessCard.title': 'Locate Wing Access Card',
  'obj.accessCard.desc':
    'Find and collect the Memory Analysis Wing security access card in the Observation Room.',
  'obj.enterWing.title': 'Enter the Memory Analysis Wing',
  'obj.enterWing.desc':
    'Unlock the secured east bulkhead using the access card and enter the Memory Analysis Wing.',
  'obj.analysisConsole.title': 'Investigate Memory Analysis Console',
  'obj.analysisConsole.desc':
    'Examine the central Memory Analysis Console inside the Memory Analysis Laboratory.',
  'obj.firstRecall.title': 'Reconstruct Memory Fragment 01',
  'obj.firstRecall.desc':
    'Use the central Memory Analysis Console to initialize reconstruction of available memory data.',
  'obj.postMemory.title': 'Review Reconstruction Findings',
  'obj.postMemory.desc':
    'Inspect the updated Memory Analysis Console status or review Fragment 01 in your Research Journal [J].',

  // HUD & Notifications
  'hud.subjectHeader': 'SUBJECT 047 // PROJECT RECALL',
  'hud.anomalyDetected': 'OBSERVATION BAY SENSOR // ANOMALY DETECTED',
  'hud.evidenceCollected': 'EVIDENCE COLLECTED — ADDED TO RESEARCH JOURNAL',
  'hud.cardCollected': 'ACCESS CARD ACQUIRED: MEMORY ANALYSIS WING',
  'hud.accessDenied':
    'ACCESS DENIED — MEMORY ANALYSIS WING ACCESS CARD REQUIRED',
  'hud.accessGranted':
    'ACCESS GRANTED — MEMORY ANALYSIS WING BULKHEAD UNLOCKED',
  'hud.flashlightLabel': 'FLASHLIGHT:',
  'hud.flashlightOn': 'ON',
  'hud.flashlightOff': 'OFF',
  'hud.journalBtn': 'JOURNAL',
  'hud.journalAria': 'Open Research Journal (J)',
  'hud.pointerHint': 'Click viewport to lock mouse · Drag to look · [J] Journal',
  'hud.muteAria': 'Mute audio (M)',
  'hud.unmuteAria': 'Unmute audio (M)',
  'hud.pauseAria': 'Pause game (P)',

  // Interactable Prompts
  'interact.terminal': 'ACCESS RESEARCH TERMINAL',
  'interact.record': 'INSPECT ARCHIVED RESEARCH RECORD [SUBJECT 012]',
  'interact.accessCard': 'COLLECT MEMORY ANALYSIS ACCESS CARD',
  'interact.securityDoorLocked': 'SECURITY BULKHEAD // SWIPE ACCESS CARD',
  'interact.neuralScan': 'INSPECT NEURAL SCAN MONITOR',
  'interact.sessionReport': 'INSPECT SUBJECT 047 SESSION REPORT',
  'interact.memoryConsole': 'ACTIVATE MEMORY ANALYSIS CONSOLE',

  // Research Terminal Modal
  'terminal.dialogAria': 'Research Terminal',
  'terminal.unit': 'OBSERVATION TERMINAL // UNIT 04',
  'terminal.statusOnline': 'STATUS: ONLINE',
  'terminal.project': 'PROJECT RECALL',
  'terminal.program': 'MEMORY RECOVERY PROGRAM',
  'terminal.subject': 'SUBJECT 047',
  'terminal.cognitiveResponse': 'COGNITIVE RESPONSE: DETECTED',
  'terminal.identityStatus': 'IDENTITY STATUS: UNKNOWN',
  'terminal.recoverySession': 'RECOVERY SESSION: FAILED',
  'terminal.closeHint': 'PRESS E OR ESC TO CLOSE',
  'terminal.closeBtn': 'CLOSE TERMINAL',

  // Archived Research Record Modal (SUBJECT 012)
  'record.dialogAria': 'Archived Research Record',
  'record.classification': 'ARCHIVED RESEARCH RECORD // LEVEL-3 CLINICAL FILE',
  'record.fileId': 'PR-LOG-012-B',
  'record.program': 'PROJECT RECALL',
  'record.title': 'SUBJECT 012 — SESSION SUSPENSION NOTICE',
  'record.summary':
    'Subject 012 was a voluntary human participant enrolled in early Phase II memory reconstruction trials.',
  'record.p1':
    'Following the fourth continuous neural recall cycle, Subject 012 exhibited severe, unexplained memory inconsistencies that did not correspond to baseline screening or any recorded biographical history.',
  'record.p2':
    'Physiological telemetry remained within nominal bounds during post-session isolation, yet interview transcripts diverged across every subsequent evaluation.',
  'record.p3':
    'All scheduled sessions for Subject 012 were suspended indefinitely pending review by the Oversight Committee. Further disposition records remain sealed.',
  'record.footerNote': 'RECORD INTEGRITY: PARTIAL // REDACTED BY FACILITY DIRECTIVE',
  'record.closeBtn': 'CLOSE RECORD',

  // Secondary Inspectables inside Memory Analysis Wing
  'neuralScan.dialogAria': 'Neural Scan Monitor',
  'neuralScan.unit': 'DIAGNOSTIC STATION // TRACE 047-A',
  'neuralScan.status': 'SCAN BUFFER: RETAINED',
  'neuralScan.title': 'BASELINE ENGRAM TOPOLOGY // SUBJECT 047',
  'neuralScan.p1':
    'Automated cortical mapping recorded persistent theta-band resonance across the hippocampal relay despite the aborted recovery protocol.',
  'neuralScan.p2':
    'Calibration markers indicate this console has already been indexed against an earlier baseline template assigned to Subject 047.',
  'neuralScan.closeBtn': 'CLOSE MONITOR',

  'sessionReport.dialogAria': 'Subject 047 Session Report',
  'sessionReport.classification': 'CLINICAL BRIEF // MEMORY ANALYSIS LAB',
  'sessionReport.fileId': 'MA-RPT-047-02',
  'sessionReport.title': 'INTERNAL MEMO — PREMATURE SESSION TERMINATION',
  'sessionReport.p1':
    'The prior reconstruction pass inside the Memory Analysis Wing was halted manually at 02:14 after signal echo overlapped with archived Subject 012 calibration channels.',
  'sessionReport.p2':
    'Do not initiate another full reconstruction cycle until an authorized supervisor verifies why Subject 047 data already resides on the primary index.',
  'sessionReport.closeBtn': 'CLOSE REPORT',

  // Central Memory Analysis Console Modal & Reconstruction Confirmation
  'memoryConsole.dialogAria': 'Memory Analysis Console',
  'memoryConsole.unit': 'MEMORY ANALYSIS LAB // CENTRAL CORE',
  'memoryConsole.status': 'ARCHIVE LINK: ACTIVE',
  'memoryConsole.statusInterrupted': 'ARCHIVE LINK: INTERRUPTED',
  'memoryConsole.project': 'PROJECT RECALL',
  'memoryConsole.system': 'MEMORY ANALYSIS SYSTEM',
  'memoryConsole.reconstructionHeader': 'MEMORY RECONSTRUCTION',
  'memoryConsole.subject': 'SUBJECT: 047',
  'memoryConsole.memoryData': 'MEMORY DATA: AVAILABLE',
  'memoryConsole.availableMemoryData': 'AVAILABLE MEMORY DATA',
  'memoryConsole.reconstructionStatus': 'RECONSTRUCTION STATUS: INCOMPLETE',
  'memoryConsole.previousSession': 'PREVIOUS SESSION: TERMINATED',
  'memoryConsole.fragmentLine': 'FRAGMENT: 01',
  'memoryConsole.statusInterruptedLine': 'RECONSTRUCTION STATUS: INTERRUPTED',
  'memoryConsole.unexpectedDataLine': 'UNEXPECTED DATA: DETECTED',
  'memoryConsole.archiveHook':
    'INDEX NOTICE: Existing baseline record detected for Subject 047 prior to current awakening timestamp. Cause and origin remain locked under Oversight Seal.',
  'memoryConsole.postMemoryNote':
    'POST-SESSION LOG: Fragment 01 destabilized during spatial observation. New investigative findings archived in Research Journal [J].',
  'memoryConsole.beginBtn': 'BEGIN RECONSTRUCTION',
  'memoryConsole.reenterBtn': 'REVISIT FRAGMENT 01',
  'memoryConsole.confirmTitle': 'INITIALIZE RECONSTRUCTION',
  'memoryConsole.confirmWarning':
    'Confirm neural immersion link for MEMORY_FRAGMENT_01. Cognitive anchoring may be unstable.',
  'memoryConsole.confirmBtn': 'INITIALIZE RECONSTRUCTION',
  'memoryConsole.cancelBtn': 'CANCEL',
  'memoryConsole.completionNote':
    'MEMORY DATA VERIFIED — READY FOR INITIALIZATION',
  'memoryConsole.closeHint': 'PRESS E OR ESC TO CLOSE',
  'memoryConsole.closeBtn': 'CLOSE CONSOLE',

  // Research Journal Modal
  'journal.dialogAria': 'Research Journal',
  'journal.header': 'SUBJECT 047 // INVESTIGATION ARCHIVE',
  'journal.title': 'RESEARCH JOURNAL',
  'journal.tabAll': 'ALL ENTRIES',
  'journal.tabCollected': 'DISCOVERED ONLY',
  'journal.countLabel': 'EVIDENCE RECOVERED',
  'journal.emptyTitle': 'NO EVIDENCE COLLECTED',
  'journal.emptyDesc':
    'Explore the facility and inspect terminals, clinical records, and security documents to record findings here.',
  'journal.sourceLabel': 'SOURCE:',
  'journal.statusDiscovered': 'DISCOVERED',
  'journal.statusUndiscovered': 'UNDISCOVERED',
  'journal.undiscoveredTitle': 'CLASSIFIED RECORD // UNDISCOVERED',
  'journal.undiscoveredHint':
    'Continue investigating the facility to locate and unlock this information.',
  'journal.closeHint': 'PRESS J OR ESC TO RETURN',
  'journal.closeBtn': 'CLOSE JOURNAL',

  // Evidence Entries
  'evidence.diag.title': 'INITIAL DIAGNOSTIC',
  'evidence.diag.source': 'Observation Terminal // Unit 04',
  'evidence.diag.body':
    'The PROJECT RECALL Memory Recovery Program terminal registered Subject 047 with an active cognitive response, yet identity status returned UNKNOWN and the recovery session was marked FAILED. Immediately after closing the terminal, an anomalous human silhouette appeared briefly behind the containment glass before the lighting flickered.',

  'evidence.sub012.title': 'SUBJECT 012 ARCHIVED RECORD',
  'evidence.sub012.source': 'Clinical File PR-LOG-012-B // Observation Desk',
  'evidence.sub012.body':
    'Subject 012 was a voluntary human participant in Phase II memory reconstruction trials. Following the fourth continuous recall cycle, Subject 012 displayed unexplained memory inconsistencies across repeated evaluations while physiological readings remained nominal. All sessions were suspended indefinitely by the Oversight Committee.',

  'evidence.access.title': 'MEMORY ANALYSIS ACCESS',
  'evidence.access.source': 'Security Stand // Sector B-04',
  'evidence.access.body':
    'Facility Security Notice: Entry into the Memory Analysis Wing is strictly restricted to authorized oversight personnel. Valid Sector B-04 magnetic clearance is required at the east Observation Room bulkhead before approaching the central analysis core.',

  'evidence.neuralScan.title': 'NEURAL SCAN LOG [TRACE 047-A]',
  'evidence.neuralScan.source': 'Diagnostic Station // Memory Analysis Lab',
  'evidence.neuralScan.body':
    'Residual theta-band oscillations detected on the hippocampal relay link. Console calibration metadata indicates Subject 047 already corresponds to an earlier stored neural baseline profile.',

  'evidence.sessionReport.title': 'SESSION TERMINATION MEMO',
  'evidence.sessionReport.source': 'Memo MA-RPT-047-02 // Memory Analysis Lab',
  'evidence.sessionReport.body':
    'Previous Memory Analysis reconstruction was manually terminated after signal echo intersected archived Subject 012 calibration frequencies. Supervisors ordered a hold before any new cycle may proceed.',

  'evidence.memoryConsole.title': 'MEMORY ANALYSIS SYSTEM READOUT',
  'evidence.memoryConsole.source': 'Central Console // Memory Analysis Wing',
  'evidence.memoryConsole.body':
    'The central Memory Analysis System confirms MEMORY DATA: AVAILABLE for Subject 047, with RECONSTRUCTION STATUS: INCOMPLETE and PREVIOUS SESSION: TERMINATED. The system retains a prior indexed record predating the current awakening event.',

  'evidence.memoryFragment01.title': 'MEMORY FRAGMENT 01 — THE UNFINISHED EVENING',
  'evidence.memoryFragment01.source':
    'Memory Reconstruction Session // MEMORY_FRAGMENT_01',
  'evidence.memoryFragment01.body':
    'Fragment ID: MEMORY_FRAGMENT_01 (Owner: UNKNOWN). Status: INTERRUPTED. During immersion inside a rain-swept apartment, three anomalies were recorded: a wall clock frozen at 11:42 repeating an unnatural tick loop, a framed photograph whose silhouettes shifted when unobserved, and an unplugged telephone receiving an unidentifiable call. The session unexpectedly shifted into Observer Mode around an unidentified living-room memory echo before revealing a cold facility doorway behind the apartment architecture and collapsing.',

  // Memory Reconstruction System (Milestone 04)
  'memory.fragmentName': 'THE UNFINISHED EVENING',
  'memory.fragmentCode': 'MEMORY FRAGMENT 01',
  'memory.transitionIn': 'INITIALIZING MEMORY FRAGMENT 01 // THE UNFINISHED EVENING',
  'memory.transitionOut': 'NEURAL LINK SEVERED // RETURNING TO LABORATORY',
  'memory.ownerUnknown': 'OWNER IDENTITY: UNKNOWN',
  'memory.modeImmersion': 'IMMERSION MODE',
  'memory.modeObserver': 'OBSERVER MODE',
  'memory.objExploreTitle': 'EXPLORE THE MEMORY',
  'memory.objExploreDesc':
    'Examine the apartment and locate subtle anomalies within the reconstruction.',
  'memory.objObserveTitle': 'OBSERVE THE MEMORY ECHO',
  'memory.objObserveDesc':
    'Observe the figure in the living room as the sequence repeats and watch for changes.',
  'memory.objDiscrepancyTitle': 'INVESTIGATE SPATIAL DISCREPANCY',
  'memory.objDiscrepancyDesc':
    'Examine the fractured study doorway where the reconstruction is breaking apart.',
  'memory.anomalyCounter': 'ANOMALIES',
  'memory.zone.entrance': 'ENTRANCE HALL',
  'memory.zone.living': 'LIVING ROOM',
  'memory.zone.study': 'STUDY',

  'memory.interact.clock': 'EXAMINE WALL CLOCK',
  'memory.interact.clockReexamine': 'RE-EXAMINE WALL CLOCK',
  'memory.interact.photo': 'EXAMINE FRAMED PHOTOGRAPH',
  'memory.interact.photoChanged': 'INSPECT CHANGED PHOTOGRAPH',
  'memory.interact.phone': 'CHECK RINGING TELEPHONE',
  'memory.interact.recorder': 'INSPECT RECORDING DEVICE',
  'memory.interact.door': 'CHECK INTERIOR DOOR',
  'memory.interact.doorDiscrepancy': 'EXAMINE FRACTURED DOORWAY',

  'memory.msg.clockFirst':
    '11:42 — The wall clock hands are motionless while a short three-tick loop repeats mechanically.',
  'memory.msg.clockAnomaly':
    'ANOMALY 01 RECORDED // FROZEN CLOCK — The second hand snaps back to the exact mark.',
  'memory.msg.photoFirst':
    'A warm evening photograph of indistinct figures inside this apartment. No faces are clear.',
  'memory.msg.photoUnchanged':
    'Nothing else seems altered yet. Step away and continue exploring the room.',
  'memory.msg.photoAnomaly':
    'ANOMALY 02 RECORDED // CHANGING PHOTOGRAPH — A shadowy silhouette now stands in the frame.',
  'memory.msg.callAnomaly':
    'ANOMALY 03 RECORDED // IMPOSSIBLE CALL — No cable connected. No caller ID. Unable to answer.',
  'memory.msg.recorderNote':
    'ANALOG TAPE RECORDER // Empty magnetic reel spinning silently on a blank calibration label.',
  'memory.msg.doorLocked':
    'CLOSED INTERIOR DOOR — The latch will not yield from within the memory.',
  'memory.msg.observerShift':
    'PERSPECTIVE SHIFT // OBSERVER MODE ACTIVE — RECONSTRUCTION FRAGMENTING',
  'memory.msg.echoCycleShift':
    'ECHO REPETITION ANOMALY — Spatial structure near the study door is fracturing.',
  'memory.msg.collapseSubtitle': 'That memory was never supposed to exist.',
  'memory.msg.anomalyToast': 'MEMORY ANOMALY DETECTED',
  'memory.canvas.photoNormal': 'EVENING STUDY // UNKNOWN',
  'memory.canvas.photoAltered': 'PRESENCE // UNRECORDED',
  'memory.canvas.clockTime': '11:42',

  // Pause Menu
  'pause.dialogAria': 'Session Paused',
  'pause.project': 'PROJECT RECALL',
  'pause.title': 'SESSION PAUSED',
  'pause.resume': 'RESUME SESSION',
  'pause.restart': 'RESTART MILESTONE',
  'pause.returnTitle': 'RETURN TO TITLE',

  // 3D Procedural Canvas Textures
  'canvas.terminalPrompt': '[PRESS E TO ACCESS TERMINAL]',
  'canvas.eegHeader': 'NEURAL TELEMETRY // CH-04',
  'canvas.dossierHeader': 'ARCHIVED RESEARCH RECORD',
  'canvas.dossierSubject': 'SUBJECT 012',
  'canvas.dossierStamp': 'SUSPENDED',
  'canvas.cardHeader': 'SECTOR B-04 ACCESS',
  'canvas.cardTitle': 'MEMORY ANALYSIS WING',
  'canvas.cardClearance': 'LEVEL-3 CLEARANCE',
  'canvas.doorLockedHeader': 'MEMORY ANALYSIS WING',
  'canvas.doorLockedStatus': 'ACCESS RESTRICTED',
  'canvas.doorUnlockedStatus': 'ACCESS GRANTED',
  'canvas.memoryConsoleTitle': 'MEMORY ANALYSIS SYSTEM',
  'canvas.memoryConsoleSub': 'SUBJECT: 047 // DATA AVAILABLE',
  'canvas.memoryConsolePrompt': '[PRESS E TO INVESTIGATE]',
  'canvas.neuralScanHeader': 'NEURAL SCAN // TRACE 047-A',
  'canvas.sessionReportHeader': 'SESSION REPORT // MA-047',
} as const;

export type TranslationKey = keyof typeof enTranslations;

export const arTranslations: Record<TranslationKey, string> = {
  // Language Switcher
  'lang.label': 'اللغة',
  'lang.en': 'EN',
  'lang.ar': 'العربية',
  'lang.toggleAria': 'التبديل إلى الإنجليزية',

  // Title Screen
  'title.milestone': 'المرحلة 04 // الاسترجاع الأول',
  'title.sector': 'القطاع البحثي B-04',
  'title.project': 'PROJECT RECALL',
  'title.gameTitle': 'THE SILENCE',
  'title.subtitle':
    'انقطع تسلسل استعادة الإدراك الخاص بـ SUBJECT 047. استكشف جناح الأبحاث تحت الأرض، واجمع السجلات، وحقّق في جناح تحليل الذاكرة.',
  'title.startCta': 'بدء الجلسة',

  // Control Hint Labels
  'controls.move': 'الحركة',
  'controls.look': 'التحكم بالكاميرا',
  'controls.interact': 'التفاعل',
  'controls.flashlight': 'المصباح',
  'controls.journal': 'المفكرة',
  'controls.pause': 'إيقاف مؤقت',
  'controls.mute': 'كتم الصوت',
  'controls.keyMouse': 'الفأرة',
  'controls.keyEsc': 'ESC',

  // Zones
  'zone.awakening': 'غرفة الإفاقة',
  'zone.corridor': 'ممر الأبحاث',
  'zone.observation': 'غرفة المراقبة',
  'zone.memoryWing': 'جناح تحليل الذاكرة',

  // Objectives System
  'obj.panelLabel': 'المهمة الحالية',
  'obj.stepFormat': 'الهدف',
  'obj.completedToast': 'اكتملت المهمة',
  'obj.allCompleteTitle': 'اكتمل التحقيق الميداني',
  'obj.allCompleteDesc':
    'انتهت المرحلة 04 — راجع نتائج الجزء 01 في مفكرة الأبحاث [J] أو واصل الاستكشاف.',

  'obj.corridor.title': 'الوصول إلى ممر الأبحاث',
  'obj.corridor.desc':
    'استكشف غرفة الإفاقة وتقدّم نحو ممر الأبحاث.',
  'obj.observation.title': 'التحقيق في غرفة المراقبة',
  'obj.observation.desc':
    'تقدّم عبر ممر الأبحاث شمالاً للوصول إلى غرفة المراقبة.',
  'obj.terminal.title': 'تفعيل وفحص محطة الأبحاث',
  'obj.terminal.desc':
    'شغّل محطة الأبحاث الرئيسية في غرفة المراقبة وافحص بياناتها.',
  'obj.record.title': 'فحص سجل [SUBJECT 012] المؤرشف',
  'obj.record.desc':
    'اعثر على سجل الأبحاث المؤرشف الخاص بـ SUBJECT 012 على المكتب الجانبي واقرأه.',
  'obj.accessCard.title': 'العثور على بطاقة دخول الجناح',
  'obj.accessCard.desc':
    'ابحث عن بطاقة التصريح الأمني لجناح تحليل الذاكرة داخل غرفة المراقبة والتقطها.',
  'obj.enterWing.title': 'دخول جناح تحليل الذاكرة',
  'obj.enterWing.desc':
    'افتح الحاجز الأمني الشرقي باستخدام البطاقة وادخل جناح تحليل الذاكرة.',
  'obj.analysisConsole.title': 'فحص وحدة تحليل الذاكرة',
  'obj.analysisConsole.desc':
    'افحص وحدة تحليل الذاكرة المركزية داخل مختبر تحليل الذاكرة.',
  'obj.firstRecall.title': 'إعادة بناء جزء الذاكرة 01',
  'obj.firstRecall.desc':
    'استخدم وحدة تحليل الذاكرة المركزية لبدء إعادة بناء بيانات الذاكرة المتوفرة.',
  'obj.postMemory.title': 'مراجعة نتائج إعادة البناء',
  'obj.postMemory.desc':
    'تفحص حالة وحدة تحليل الذاكرة المحدّثة أو راجع سجل الجزء 01 في مفكرة الأبحاث [J].',

  // HUD & Notifications
  'hud.subjectHeader': 'SUBJECT 047 // PROJECT RECALL',
  'hud.anomalyDetected': 'مستشعر غرفة المراقبة // تم رصد نشاط غير معتاد',
  'hud.evidenceCollected': 'تم جمع دليل جديد — أُضيف إلى مفكرة الأبحاث',
  'hud.cardCollected': 'تم الحصول على بطاقة تصريح: جناح تحليل الذاكرة',
  'hud.accessDenied':
    'تم رفض الدخول — يلزم بطاقة تصريح جناح تحليل الذاكرة',
  'hud.accessGranted':
    'تم منح التصريح — فُتح الحاجز الأمني لجناح تحليل الذاكرة',
  'hud.flashlightLabel': 'المصباح:',
  'hud.flashlightOn': 'مُضاء',
  'hud.flashlightOff': 'مُطفأ',
  'hud.journalBtn': 'المفكرة',
  'hud.journalAria': 'فتح مفكرة الأبحاث (J)',
  'hud.pointerHint': 'انقر لتثبيت الفأرة · اسحب للنظر · [J] المفكرة',
  'hud.muteAria': 'كتم الصوت (M)',
  'hud.unmuteAria': 'إلغاء كتم الصوت (M)',
  'hud.pauseAria': 'إيقاف مؤقت (P)',

  // Interactable Prompts
  'interact.terminal': 'فتح محطة الأبحاث',
  'interact.record': 'فحص سجل الأبحاث المؤرشف [SUBJECT 012]',
  'interact.accessCard': 'التقاط بطاقة تصريح جناح تحليل الذاكرة',
  'interact.securityDoorLocked': 'حاجز أمني // تمرير بطاقة التصريح',
  'interact.neuralScan': 'فحص شاشة المسح العصبي',
  'interact.sessionReport': 'فحص تقرير جلسة SUBJECT 047',
  'interact.memoryConsole': 'تشغيل وحدة تحليل الذاكرة المركزية',

  // Research Terminal Modal
  'terminal.dialogAria': 'محطة الأبحاث',
  'terminal.unit': 'محطة المراقبة // الوحدة 04',
  'terminal.statusOnline': 'الحالة: متصلة',
  'terminal.project': 'PROJECT RECALL',
  'terminal.program': 'برنامج استعادة الذاكرة',
  'terminal.subject': 'SUBJECT 047',
  'terminal.cognitiveResponse': 'الاستجابة الإدراكية: تم رصدها',
  'terminal.identityStatus': 'حالة الهوية: غير معروفة',
  'terminal.recoverySession': 'جلسة استعادة الذاكرة: فشلت',
  'terminal.closeHint': 'اضغط E أو ESC للإغلاق',
  'terminal.closeBtn': 'إغلاق المحطة',

  // Archived Research Record Modal (SUBJECT 012)
  'record.dialogAria': 'سجل الأبحاث المؤرشف',
  'record.classification': 'سجل الأبحاث المؤرشف // ملف سريري من المستوى الثالث',
  'record.fileId': 'PR-LOG-012-B',
  'record.program': 'PROJECT RECALL',
  'record.title': 'SUBJECT 012 — إشعار تعليق الجلسات',
  'record.summary':
    'كان SUBJECT 012 مشاركاً بشرياً متطوعاً التحق بالتجارب المبكرة للمرحلة الثانية من برنامج إعادة بناء الذاكرة.',
  'record.p1':
    'عقب دورة الاسترجاع العصبي المتواصلة الرابعة، أظهر SUBJECT 012 تناقضات حادة وغير مفسّرة في الذاكرة لم تتطابق مع الفحص المبدئي أو أي سجل تاريخي موثق لسيرته.',
  'record.p2':
    'بقيت المؤشرات الفسيولوجية ضمن النطاق الطبيعي أثناء العزل اللاحق للجلسة، غير أن محاضر المقابلات تباينت مع كل تقييم لاحق.',
  'record.p3':
    'تم تعليق جميع الجلسات المجدولة لـ SUBJECT 012 إلى أجل غير مسمى ريثما تكتمل مراجعة لجنة الرقابة. وتبقى بقية سجلات الإجراء مختومة.',
  'record.footerNote': 'سلامة السجل: جزئية // خضع للتنقيح بتوجيه من إدارة المنشأة',
  'record.closeBtn': 'إغلاق السجل',

  // Secondary Inspectables inside Memory Analysis Wing
  'neuralScan.dialogAria': 'شاشة المسح العصبي',
  'neuralScan.unit': 'محطة التشخيص // المسار 047-A',
  'neuralScan.status': 'مخزن المسح: محفوظ',
  'neuralScan.title': 'تخطيط البصمة العصبية الأساسي // SUBJECT 047',
  'neuralScan.p1':
    'رصدت الخريطة القشرية الآلية رنيناً مستمراً في نطاق ثيتا عبر الموصّل الحُصيني رغم فشل بروتوكول الاستعادة.',
  'neuralScan.p2':
    'تشير علامات المعايرة إلى أن هذه الوحدة قد فُهرست مسبقاً مقابل قالب خط أساس سابق مخصّص لـ SUBJECT 047.',
  'neuralScan.closeBtn': 'إغلاق الشاشة',

  'sessionReport.dialogAria': 'تقرير جلسة SUBJECT 047',
  'sessionReport.classification': 'مذكرة سريرية // مختبر تحليل الذاكرة',
  'sessionReport.fileId': 'MA-RPT-047-02',
  'sessionReport.title': 'مذكرة داخلية — إنهاء مبكر للجلسة',
  'sessionReport.p1':
    'تم إيقاف محاولة إعادة البناء السابقة داخل جناح تحليل الذاكرة يدوياً عند الساعة 02:14 بعد تداخل صدى الإشارة مع قنوات معايرة SUBJECT 012 المؤرشفة.',
  'sessionReport.p2':
    'يُحظر بدء دورة إعادة بناء كاملة جديدة قبل أن يتحقق مشرف مخوّل من سبب وجود بيانات SUBJECT 047 مسبقاً ضمن الفهرس الرئيسي.',
  'sessionReport.closeBtn': 'إغلاق التقرير',

  // Central Memory Analysis Console Modal & Reconstruction Confirmation
  'memoryConsole.dialogAria': 'وحدة تحليل الذاكرة',
  'memoryConsole.unit': 'مختبر تحليل الذاكرة // النواة المركزية',
  'memoryConsole.status': 'رابط الأرشيف: نشط',
  'memoryConsole.statusInterrupted': 'رابط الأرشيف: مُنقطع',
  'memoryConsole.project': 'PROJECT RECALL',
  'memoryConsole.system': 'نظام تحليل الذاكرة',
  'memoryConsole.reconstructionHeader': 'إعادة بناء الذاكرة',
  'memoryConsole.subject': 'SUBJECT: 047',
  'memoryConsole.memoryData': 'بيانات الذاكرة: متوفرة',
  'memoryConsole.availableMemoryData': 'بيانات الذاكرة متوفرة',
  'memoryConsole.reconstructionStatus': 'حالة إعادة البناء: غير مكتملة',
  'memoryConsole.previousSession': 'الجلسة السابقة: مُنهية',
  'memoryConsole.fragmentLine': 'FRAGMENT: 01',
  'memoryConsole.statusInterruptedLine': 'حالة إعادة البناء: مُنقطعة',
  'memoryConsole.unexpectedDataLine': 'بيانات غير متوقعة: تم رصدها',
  'memoryConsole.archiveHook':
    'إشعار الفهرس: تم العثور على سجل أساسي مسبق لـ SUBJECT 047 يسبق التوقيت الحالي للإفاقة. تبقى الأسباب والمصدر مقفلة تحت ختم لجنة الرقابة.',
  'memoryConsole.postMemoryNote':
    'سجل ما بعد الجلسة: اضطرب الجزء 01 أثناء المراقبة المكانية. أُضيفت النتائج الجديدة إلى مفكرة الأبحاث [J].',
  'memoryConsole.beginBtn': 'بدء إعادة البناء',
  'memoryConsole.reenterBtn': 'إعادة دخول الجزء 01',
  'memoryConsole.confirmTitle': 'بدء إعادة البناء',
  'memoryConsole.confirmWarning':
    'تأكيد الربط العصبي مع MEMORY_FRAGMENT_01. قد تكون نقاط التثبيت الإدراكي غير مستقرة.',
  'memoryConsole.confirmBtn': 'بدء إعادة البناء',
  'memoryConsole.cancelBtn': 'إلغاء',
  'memoryConsole.completionNote':
    'تم التحقق من بيانات الذاكرة — جاهزة للتهيئة',
  'memoryConsole.closeHint': 'اضغط E أو ESC للإغلاق',
  'memoryConsole.closeBtn': 'إغلاق الوحدة',

  // Research Journal Modal
  'journal.dialogAria': 'مفكرة الأبحاث',
  'journal.header': 'SUBJECT 047 // أرشيف التحقيق',
  'journal.title': 'مفكرة الأبحاث',
  'journal.tabAll': 'جميع السجلات',
  'journal.tabCollected': 'المكتشفة فقط',
  'journal.countLabel': 'الأدلة المجمّعة',
  'journal.emptyTitle': 'لم يتم جمع أي أدلة بعد',
  'journal.emptyDesc':
    'استكشف المنشأة وافحص المحطات والوثائق السريرية وتصاريح الأمان لتسجيل النتائج هنا.',
  'journal.sourceLabel': 'المصدر:',
  'journal.statusDiscovered': 'تم الاكتشاف',
  'journal.statusUndiscovered': 'غير مكتشف',
  'journal.undiscoveredTitle': 'سجل مصنّف // غير مكتشف',
  'journal.undiscoveredHint':
    'واصل التحقيق داخل المنشأة للعثور على هذه المعلومات وكشف محتواها.',
  'journal.closeHint': 'اضغط J أو ESC للعودة',
  'journal.closeBtn': 'إغلاق المفكرة',

  // Evidence Entries
  'evidence.diag.title': 'التشخيص الأولي',
  'evidence.diag.source': 'محطة المراقبة // الوحدة 04',
  'evidence.diag.body':
    'سجّلت محطة برنامج استعادة الذاكرة التابع لـ PROJECT RECALL وجود استجابة إدراكية لـ SUBJECT 047، بينما ظهرت حالة الهوية كغير معروفة وفشلت جلسة الاستعادة. وعقب إغلاق المحطة مباشرة، ظهر طيف بشري غامض خلف زجاج الاحتواء ثم اختفى أثناء وميض الإضاءة.',

  'evidence.sub012.title': 'سجل الأبحاث المؤرشف — SUBJECT 012',
  'evidence.sub012.source': 'الملف السريري PR-LOG-012-B // مكتب المراقبة',
  'evidence.sub012.body':
    'كان SUBJECT 012 مشاركاً بشرياً متطوعاً في تجارب المرحلة الثانية لإعادة بناء الذاكرة. بعد دورة الاسترجاع الرابعة، أظهر تناقضات غير مفسّرة في الذاكرة عبر كل تقييم رغم استقرار مؤشراته الفسيولوجية، مما أدى إلى تعليق جلساته إلى أجل غير مسمى.',

  'evidence.access.title': 'تصريح دخول تحليل الذاكرة',
  'evidence.access.source': 'منصة الأمان // القطاع B-04',
  'evidence.access.body':
    'إشعار أمن المنشأة: يقتصر الدخول إلى جناح تحليل الذاكرة على الموظفين المخوّلين فقط. يتطلب عبور الحاجز الأمني الشرقي في غرفة المراقبة بطاقة تصريح مغناطيسية صالحة للقطاع B-04.',

  'evidence.neuralScan.title': 'سجل المسح العصبي [TRACE 047-A]',
  'evidence.neuralScan.source': 'محطة التشخيص // مختبر تحليل الذاكرة',
  'evidence.neuralScan.body':
    'رصدت أجهزة القياس تذبذبات ثيتا متبقية عبر الموصّل الحُصيني، وتؤكد بيانات المعايرة ارتباط SUBJECT 047 بملف خط أساس عصبي مخزّن مسبقاً.',

  'evidence.sessionReport.title': 'مذكرة إنهاء الجلسة',
  'evidence.sessionReport.source': 'المذكرة MA-RPT-047-02 // مختبر تحليل الذاكرة',
  'evidence.sessionReport.body':
    'أُوقفت محاولة إعادة البناء السابقة يدوياً بعد تداخل صدى الإشارة مع ترددات معايرة SUBJECT 012 المؤرشفة، مع صدور أمر بتعليق أي دورة جديدة لحين المراجعة.',

  'evidence.memoryConsole.title': 'قراءة نظام تحليل الذاكرة',
  'evidence.memoryConsole.source': 'الوحدة المركزية // جناح تحليل الذاكرة',
  'evidence.memoryConsole.body':
    'تؤكد وحدة نظام تحليل الذاكرة أن بيانات الذاكرة متوفرة لـ SUBJECT 047، مع بقاء حالة إعادة البناء غير مكتملة وإنهاء الجلسة السابقة. ويحتفظ النظام بسجل مفهرس يسبق لحظة الإفاقة الحالية.',

  'evidence.memoryFragment01.title': 'MEMORY FRAGMENT 01 — الأمسية غير المكتملة',
  'evidence.memoryFragment01.source':
    'جلسة إعادة بناء الذاكرة // MEMORY_FRAGMENT_01',
  'evidence.memoryFragment01.body':
    'معرّف الجزء: MEMORY_FRAGMENT_01 (المالك: غير معروف). الحالة: مُنقطعة. أثناء الانغماس داخل شقة سكنية تحت المطر، سُجّلت ثلاث شذوذات: ساعة حائط متوقفة عند 11:42 بتكرار دق غير طبيعي، صورة مؤطرة تغيرت تفاصيلها عند الابتعاد عنها، وهاتف غير موصول بالكابل تلقى اتصالاً مجهولاً. تحوّل المنظور تلقائياً إلى وضع المراقب حول صدى بشري غير محدد الهوية قبل ظهور فجوة لممر المنشأة خلف الباب وانهيار الذكرى.',

  // Memory Reconstruction System (Milestone 04)
  'memory.fragmentName': 'الأمسية غير المكتملة',
  'memory.fragmentCode': 'MEMORY FRAGMENT 01',
  'memory.transitionIn': 'جارٍ تهيئة MEMORY FRAGMENT 01 // الأمسية غير المكتملة',
  'memory.transitionOut': 'انقطع الرابط العصبي // العودة إلى المختبر',
  'memory.ownerUnknown': 'هوية المالك: غير معروفة',
  'memory.modeImmersion': 'وضع الانغماس',
  'memory.modeObserver': 'وضع المراقب',
  'memory.objExploreTitle': 'استكشف الذاكرة',
  'memory.objExploreDesc':
    'تفحص الشقة السكنية وحدد الشذوذات غير المستقرة داخل إعادة البناء.',
  'memory.objObserveTitle': 'راقب صدى الذاكرة',
  'memory.objObserveDesc':
    'راقب الطيف في غرفة المعيشة مع تكرار الحدث وانتبه لأي تغيّر.',
  'memory.objDiscrepancyTitle': 'تحقق من التناقض المكاني',
  'memory.objDiscrepancyDesc':
    'افحص باب غرفة الدراسة المتصدّع حيث ينهار البناء المكاني للذكرى.',
  'memory.anomalyCounter': 'الشذوذات',
  'memory.zone.entrance': 'بهو المدخل',
  'memory.zone.living': 'غرفة المعيشة',
  'memory.zone.study': 'غرفة الدراسة',

  'memory.interact.clock': 'فحص ساعة الحائط',
  'memory.interact.clockReexamine': 'إعادة فحص ساعة الحائط',
  'memory.interact.photo': 'فحص الصورة المؤطرة',
  'memory.interact.photoChanged': 'تفحص التغيّر في الصورة',
  'memory.interact.phone': 'فحص الهاتف الرنّان',
  'memory.interact.recorder': 'فحص جهاز التسجيل القديم',
  'memory.interact.door': 'فحص الباب الداخلي',
  'memory.interact.doorDiscrepancy': 'فحص التصدّع خلف الباب',

  'memory.msg.clockFirst':
    '11:42 — عقارب ساعة الحائط متوقفة بينما يتكرر إيقاع دقّات قصير على نحو غير طبيعي.',
  'memory.msg.clockAnomaly':
    'تم تسجيل الشذوذ 01 // الساعة المتجمدة — عقرب الثواني يرتد للموضع ذاته.',
  'memory.msg.photoFirst':
    'صورة عائلية دافئة لأشخاص غير واضحي المعالم داخل هذه الشقة دون أي ملامح قابلة للتمييز.',
  'memory.msg.photoUnchanged':
    'لم يتغيّر شيء ظاهر بعد. ابتعد قليلاً وواصل استكشاف الغرفة.',
  'memory.msg.photoAnomaly':
    'تم تسجيل الشذوذ 02 // الصورة المتغيرة — ظهر طيف إضافي في خلفية الإطار.',
  'memory.msg.callAnomaly':
    'تم تسجيل الشذوذ 03 // الاتصال المستحيل — لا يوجد كابل موصول ولا هوية للمتصل.',
  'memory.msg.recorderNote':
    'مسجّل أشرطة قديم // بكرة فارغة تدور بصمت فوق ملصق معايرة ممحو.',
  'memory.msg.doorLocked':
    'باب داخلي مغلق — لا يستجيب القفل لمحاولات الفتح من داخل الذكرى.',
  'memory.msg.observerShift':
    'تحوّل المنظور // وضع المراقب نشط — البناء يتفكك',
  'memory.msg.echoCycleShift':
    'شذوذ تكرار الصدى — البنية المكانية عند باب الدراسة تتصدّع.',
  'memory.msg.collapseSubtitle': 'لم يكن من المفترض أن توجد تلك الذكرى.',
  'memory.msg.anomalyToast': 'تم رصد شذوذ في الذاكرة',
  'memory.canvas.photoNormal': 'أمسية // غير معروف',
  'memory.canvas.photoAltered': 'حضور // غير مسجّل',
  'memory.canvas.clockTime': '11:42',

  // Pause Menu
  'pause.dialogAria': 'تم إيقاف الجلسة مؤقتاً',
  'pause.project': 'PROJECT RECALL',
  'pause.title': 'إيقاف مؤقت',
  'pause.resume': 'استئناف الجلسة',
  'pause.restart': 'إعادة تشغيل المرحلة',
  'pause.returnTitle': 'العودة إلى الشاشة الرئيسية',

  // 3D Procedural Canvas Textures
  'canvas.terminalPrompt': '[اضغط E لفتح المحطة]',
  'canvas.eegHeader': 'القياس العصبي // CH-04',
  'canvas.dossierHeader': 'سجل الأبحاث المؤرشف',
  'canvas.dossierSubject': 'SUBJECT 012',
  'canvas.dossierStamp': 'مُعلّق',
  'canvas.cardHeader': 'تصريح القطاع B-04',
  'canvas.cardTitle': 'جناح تحليل الذاكرة',
  'canvas.cardClearance': 'تصريح مستوى 3',
  'canvas.doorLockedHeader': 'جناح تحليل الذاكرة',
  'canvas.doorLockedStatus': 'الدخول مقيد',
  'canvas.doorUnlockedStatus': 'تم منح التصريح',
  'canvas.memoryConsoleTitle': 'نظام تحليل الذاكرة',
  'canvas.memoryConsoleSub': 'SUBJECT: 047 // البيانات متوفرة',
  'canvas.memoryConsolePrompt': '[اضغط E للفحص]',
  'canvas.neuralScanHeader': 'المسح العصبي // TRACE 047-A',
  'canvas.sessionReportHeader': 'تقرير الجلسة // MA-047',
};

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: enTranslations,
  ar: arTranslations,
};

