/**
 * Integration contracts the checkup UI depends on. PROPOSED: the real Tillee
 * save, import, upload and estimate APIs were not available; real adapters
 * must implement these interfaces by mapping to the existing endpoints.
 */
import type { ImportedFields } from '../rules/registry';
import type { SavedDraft, Submission } from '../engine/flow';

export interface CheckupPersistence {
  loadDraft(): Promise<SavedDraft | null>;
  /** Must reject on failure; the UI only shows "Saved" on resolve. */
  saveDraft(draft: SavedDraft): Promise<{ savedAt: string }>;
  /** Must be idempotent per key so a double submit cannot complete twice. */
  complete(submission: Submission, idempotencyKey: string): Promise<{ completedAt: string }>;
}

export type PayrollImportResult =
  | { status: 'connected'; fields: ImportedFields }
  | { status: 'unavailable' };

export interface PayrollImportService {
  fetch(): Promise<PayrollImportResult>;
}

export type DocumentStatus = 'uploading' | 'processing' | 'processed' | 'noTaxData' | 'failed' | 'rejected';

export type DocumentRecord = {
  id: string;
  name: string;
  sizeBytes: number;
  status: DocumentStatus;
  /** Present only once processing has actually succeeded. */
  extracted?: ImportedFields;
};

export interface DocumentService {
  upload(file: File, onUpdate: (rec: DocumentRecord) => void): Promise<DocumentRecord>;
  remove(id: string): Promise<void>;
  get(id: string): DocumentRecord | undefined;
}

export type EstimateResult =
  | { status: 'unavailable' }
  | { status: 'processing' }
  | { status: 'missingInputs'; missingCopyKeys: string[] }
  | { status: 'error' }
  /**
   * DEMO ONLY. A fixture result, always rendered with a "Demo data" label.
   * The real estimate response shape must replace this.
   */
  | { status: 'demo'; direction: 'mayOwe' | 'mayGetRefund' | 'onTrack'; rangeCents: [number, number]; asOf: string };

export interface EstimateService {
  request(submission: Submission): Promise<EstimateResult>;
}

export type CheckupServices = {
  persistence: CheckupPersistence;
  payroll: PayrollImportService;
  documents: DocumentService;
  estimate: EstimateService;
};
