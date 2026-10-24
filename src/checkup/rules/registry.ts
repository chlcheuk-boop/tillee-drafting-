import type { AnswerRecord, Answers, QuestionDefinition } from '../types';

/**
 * Imported values available to the flow. Produced by the import adapter from
 * payroll or processed documents; never from unvalidated uploads.
 */
export type ImportedValue = {
  value: number | string;
  source: 'payroll' | 'document';
  /** Date the source data is current as of (pay date / document date). */
  sourceDate: string;
  taxYear: number;
  sourceLabel: string;
};

export type ImportedFields = Partial<Record<string, ImportedValue>>;

export type RuleContext = {
  taxYear: number;
  /** Imported values for the currently selected pay-info source. */
  imported: ImportedFields;
};

type Predicate = (answers: Answers, ctx: RuleContext) => boolean;

const answered = (a: AnswerRecord | undefined) => a?.status === 'answered';
const valueOf = (answers: Answers, id: string) =>
  answered(answers[id]) ? answers[id].value : undefined;
const includes = (answers: Answers, id: string, v: string) => {
  const val = valueOf(answers, id);
  return Array.isArray(val) && val.includes(v);
};
/** Imported values only count when they belong to the checkup's tax year. */
const hasImported = (ctx: RuleContext, key: string) =>
  ctx.imported[key]?.taxYear === ctx.taxYear;
const sourceIs = (answers: Answers, v: string) => valueOf(answers, 'payInfoSource') === v;
const sourceIsImport = (answers: Answers) =>
  sourceIs(answers, 'payroll') || sourceIs(answers, 'upload');

/**
 * Visibility predicates, referenced by key from question config. Config can
 * only reference these; it cannot carry executable expressions.
 */
export const visibilityRules: Record<string, Predicate> = {
  payInfoIsUpload: (a) => sourceIs(a, 'upload'),
  hasImportedYtdWages: (a, ctx) => sourceIsImport(a) && hasImported(ctx, 'ytdGrossWages'),
  hasImportedYtdWithholding: (a, ctx) =>
    sourceIsImport(a) && hasImported(ctx, 'ytdFederalWithholding'),
  // A failed or empty import must never trap the user: fall back to manual entry.
  needsManualWages: (a, ctx) =>
    sourceIs(a, 'manual') || (sourceIsImport(a) && !hasImported(ctx, 'ytdGrossWages') && importSettled(a, ctx)),
  needsManualWithholding: (a, ctx) =>
    sourceIs(a, 'manual') ||
    (sourceIsImport(a) && !hasImported(ctx, 'ytdFederalWithholding') && importSettled(a, ctx)),
  startedThisYear: (a) => valueOf(a, 'startedThisYear') === 'yes',
  filingJointly: (a) => valueOf(a, 'expectedFilingStatus') === 'marriedJoint',
  spouseWorks: (a) =>
    valueOf(a, 'expectedFilingStatus') === 'marriedJoint' && valueOf(a, 'spouseWorks') === 'yes',
  hasDependents: (a) => valueOf(a, 'hasDependents') === 'yes',
  hasFreelance: (a) => includes(a, 'otherIncomeTypes', 'freelance'),
  hasSecondJob: (a) => includes(a, 'otherIncomeTypes', 'secondJob'),
  hasInvestments: (a) => includes(a, 'otherIncomeTypes', 'investments'),
  hasRental: (a) => includes(a, 'otherIncomeTypes', 'rental'),
};

/**
 * For uploads, manual fallbacks only appear once the upload question has an
 * answer (documents processed or the user skipped). Payroll is settled as soon
 * as it is selected because the connection status is known up front.
 */
function importSettled(a: Answers, _ctx: RuleContext): boolean {
  if (sourceIs(a, 'payroll')) return true;
  const up = a['payStub'];
  return up?.status === 'answered' || up?.status === 'skipped';
}

export const requiredRules: Record<string, Predicate> = {
  never: () => false,
};

export type ValidationResult = { errorKey: string } | null;
type Validator = (value: unknown, q: QuestionDefinition, ctx: RuleContext) => ValidationResult;

export const validators: Record<string, Validator> = {
  nonNegativeAmount: (v) =>
    typeof v === 'number' && Number.isInteger(v) && v >= 0 ? null : { errorKey: 'error.amountNonNegative' },
  signedAmount: (v) =>
    typeof v === 'number' && Number.isInteger(v) ? null : { errorKey: 'error.amountInvalid' },
  wholeNumber: (v, q) => {
    if (typeof v !== 'number' || !Number.isInteger(v)) return { errorKey: 'error.wholeNumber' };
    if (q.type === 'number' && ((q.min !== undefined && v < q.min) || (q.max !== undefined && v > q.max)))
      return { errorKey: 'error.outOfRange' };
    return null;
  },
  dateInTaxYear: (v, _q, ctx) => {
    if (typeof v !== 'string' || !isValidIsoDate(v)) return { errorKey: 'error.dateInvalid' };
    return v.startsWith(`${ctx.taxYear}-`) ? null : { errorKey: 'error.dateNotInTaxYear' };
  },
};

export function isValidIsoDate(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}
