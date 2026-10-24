/**
 * FIXTURE adapters. Every service here stands in for a real Tillee contract
 * that was not available (persistence, payroll import, document processing,
 * estimate). They are clearly simulated and must never ship in a production
 * path. Real adapters implement the same interfaces in ./contracts.ts.
 */
import type { ImportedFields } from '../rules/registry';
import type { SavedDraft, Submission } from '../engine/flow';
import type {
  CheckupPersistence,
  DocumentRecord,
  DocumentService,
  EstimateResult,
  EstimateService,
  PayrollImportResult,
  PayrollImportService,
} from './contracts';

/** Scenario switches exposed in the prototype control panel. */
export type FixtureScenario = {
  payroll: 'connected' | 'unavailable' | 'updatedValues';
  saveFails: boolean;
  completeFails: boolean;
  documentFails: boolean;
  estimate: EstimateResult['status'];
  latencyMs: number;
};

export const scenario: FixtureScenario = {
  payroll: 'connected',
  saveFails: false,
  completeFails: false,
  documentFails: false,
  estimate: 'unavailable',
  latencyMs: 600,
};

const wait = (ms = scenario.latencyMs) => new Promise((r) => setTimeout(r, ms));
const TAX_YEAR = 2026;

// Synthetic values only. Not derived from any real person.
const PAYROLL_FIELDS: ImportedFields = {
  ytdGrossWages: { value: 4_123_400, source: 'payroll', sourceDate: '2026-10-15', taxYear: TAX_YEAR, sourceLabel: 'source.payroll' },
  ytdFederalWithholding: { value: 382_150, source: 'payroll', sourceDate: '2026-10-15', taxYear: TAX_YEAR, sourceLabel: 'source.payroll' },
};
const PAYROLL_UPDATED: ImportedFields = {
  ytdGrossWages: { value: 4_310_900, source: 'payroll', sourceDate: '2026-10-31', taxYear: TAX_YEAR, sourceLabel: 'source.payroll' },
  ytdFederalWithholding: { value: 399_420, source: 'payroll', sourceDate: '2026-10-31', taxYear: TAX_YEAR, sourceLabel: 'source.payroll' },
};

export const payrollFixture: PayrollImportService = {
  async fetch(): Promise<PayrollImportResult> {
    await wait();
    if (scenario.payroll === 'unavailable') return { status: 'unavailable' };
    return { status: 'connected', fields: scenario.payroll === 'updatedValues' ? PAYROLL_UPDATED : PAYROLL_FIELDS };
  },
};

let docSeq = 0;
const docs = new Map<string, DocumentRecord>();

export const documentFixture: DocumentService = {
  async upload(file, onUpdate) {
    const id = `doc_${++docSeq}`;
    const rec: DocumentRecord = { id, name: file.name, sizeBytes: file.size, status: 'uploading' };
    docs.set(id, rec);
    onUpdate({ ...rec });
    await wait();
    if (scenario.documentFails) {
      const failed = { ...rec, status: 'failed' as const };
      docs.set(id, failed);
      onUpdate(failed);
      return failed;
    }
    const processing = { ...rec, status: 'processing' as const };
    docs.set(id, processing);
    onUpdate(processing);
    await wait(scenario.latencyMs * 2);
    // Only files explicitly named as synthetic pay stubs "extract" data. Any
    // other file (e.g. business background PDFs) is honestly reported as
    // containing no pay details, never as a successful extraction.
    const done: DocumentRecord = /synthetic[-_ ]?pay[-_ ]?stub/i.test(file.name)
      ? {
          ...rec,
          status: 'processed',
          extracted: {
            ytdGrossWages: { value: 3_987_500, source: 'document', sourceDate: '2026-09-30', taxYear: TAX_YEAR, sourceLabel: 'source.document' },
            ytdFederalWithholding: { value: 351_000, source: 'document', sourceDate: '2026-09-30', taxYear: TAX_YEAR, sourceLabel: 'source.document' },
          },
        }
      : { ...rec, status: 'noTaxData' };
    docs.set(id, done);
    onUpdate(done);
    return done;
  },
  async remove(id) {
    await wait(200);
    docs.delete(id);
  },
  get(id) {
    return docs.get(id);
  },
};

let stored: SavedDraft | null = null;
const completedKeys = new Set<string>();

export const persistenceFixture: CheckupPersistence = {
  async loadDraft() {
    await wait(300);
    return stored ? structuredClone(stored) : null;
  },
  async saveDraft(draft) {
    await wait();
    if (scenario.saveFails) throw new Error('fixture: save failed');
    stored = structuredClone(draft);
    return { savedAt: new Date().toISOString() };
  },
  async complete(submission: Submission, idempotencyKey: string) {
    await wait(scenario.latencyMs * 1.5);
    if (scenario.completeFails) throw new Error('fixture: completion failed');
    // Idempotent: repeating a key never creates a second completion.
    completedKeys.add(idempotencyKey);
    lastSubmission = submission;
    return { completedAt: new Date().toISOString() };
  },
};

/** Exposed for the prototype panel so reviewers can inspect the payload. */
export let lastSubmission: Submission | null = null;
export const completionCount = () => completedKeys.size;

export const estimateFixture: EstimateService = {
  async request() {
    await wait(scenario.latencyMs * 2);
    switch (scenario.estimate) {
      case 'unavailable':
        return { status: 'unavailable' };
      case 'processing':
        return { status: 'processing' };
      case 'missingInputs':
        return { status: 'missingInputs', missingCopyKeys: ['missing.ytdWithholding'] };
      case 'error':
        throw new Error('fixture: estimate failed');
      case 'demo':
        return {
          status: 'demo',
          direction: 'mayOwe',
          rangeCents: [40_000, 90_000],
          asOf: '2026-10-15',
        };
    }
  },
};

export function resetFixtures() {
  stored = null;
  completedKeys.clear();
  lastSubmission = null;
  docs.clear();
}
