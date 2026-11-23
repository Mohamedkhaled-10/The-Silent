import { TranslationKey } from '../i18n';

export type EvidenceId =
  | 'initial_diagnostic'
  | 'subject_012_record'
  | 'memory_access_notice'
  | 'neural_scan_log'
  | 'session_report_memo'
  | 'memory_console_readout'
  | 'memory_fragment_01';

export interface EvidenceDef {
  id: EvidenceId;
  code: string;
  titleKey: TranslationKey;
  sourceKey: TranslationKey;
  bodyKey: TranslationKey;
}

export const EVIDENCE_DEFS: readonly EvidenceDef[] = [
  {
    id: 'initial_diagnostic',
    code: 'PR-DIAG-047',
    titleKey: 'evidence.diag.title',
    sourceKey: 'evidence.diag.source',
    bodyKey: 'evidence.diag.body',
  },
  {
    id: 'subject_012_record',
    code: 'PR-LOG-012-B',
    titleKey: 'evidence.sub012.title',
    sourceKey: 'evidence.sub012.source',
    bodyKey: 'evidence.sub012.body',
  },
  {
    id: 'memory_access_notice',
    code: 'SEC-B04-LVL3',
    titleKey: 'evidence.access.title',
    sourceKey: 'evidence.access.source',
    bodyKey: 'evidence.access.body',
  },
  {
    id: 'neural_scan_log',
    code: 'TRACE-047-A',
    titleKey: 'evidence.neuralScan.title',
    sourceKey: 'evidence.neuralScan.source',
    bodyKey: 'evidence.neuralScan.body',
  },
  {
    id: 'session_report_memo',
    code: 'MA-RPT-047-02',
    titleKey: 'evidence.sessionReport.title',
    sourceKey: 'evidence.sessionReport.source',
    bodyKey: 'evidence.sessionReport.body',
  },
  {
    id: 'memory_console_readout',
    code: 'MA-SYS-047',
    titleKey: 'evidence.memoryConsole.title',
    sourceKey: 'evidence.memoryConsole.source',
    bodyKey: 'evidence.memoryConsole.body',
  },
  {
    id: 'memory_fragment_01',
    code: 'MFR-01-UE',
    titleKey: 'evidence.memoryFragment01.title',
    sourceKey: 'evidence.memoryFragment01.source',
    bodyKey: 'evidence.memoryFragment01.body',
  },
] as const;

export interface EvidenceState {
  discoveredIds: EvidenceId[];
}

export function createInitialEvidenceState(): EvidenceState {
  return {
    discoveredIds: [],
  };
}

export function isEvidenceDiscovered(
  state: EvidenceState,
  id: EvidenceId
): boolean {
  return state.discoveredIds.includes(id);
}

/**
 * Adds a newly discovered evidence entry if not already collected.
 * Locale-independent IDs guarantee language switching never duplicates or resets entries.
 */
export function collectEvidence(
  state: EvidenceState,
  id: EvidenceId
): { next: EvidenceState; added: boolean } {
  if (state.discoveredIds.includes(id)) {
    return { next: state, added: false };
  }
  return {
    next: {
      discoveredIds: [...state.discoveredIds, id],
    },
    added: true,
  };
}
