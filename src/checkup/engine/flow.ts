import type {
  AnswerRecord,
  Answers,
  CheckupConfig,
  ConfirmImportedQuestion,
  MultiChoiceQuestion,
  QuestionDefinition,
} from '../types';
import { isValidIsoDate, requiredRules, validators, visibilityRules, type RuleContext } from '../rules/registry';

/**
 * Pure flow logic: visible path, validation, progress, submission and resume
 * reconciliation. No React, no I/O, no tax math.
 */

/**
 * Walk the config in order, evaluating each question's visibility against only
 * the answers of questions already found visible. This cascades: hiding a
 * controlling question also hides everything that depends on it, even if a
 * stale answer for that controller is still held in the draft.
 */
export function resolvePath(config: CheckupConfig, answers: Answers, ctx: RuleContext) {
  const effective: Answers = {};
  const path: QuestionDefinition[] = [];
  for (const q of config.questions) {
    const rule = q.visibilityRuleKey ? visibilityRules[q.visibilityRuleKey] : undefined;
    if (q.visibilityRuleKey && !rule) throw new Error(`Unknown visibility rule: ${q.visibilityRuleKey}`);
    if (rule && !rule(effective, ctx)) continue;
    path.push(q);
    if (answers[q.id]) effective[q.id] = answers[q.id];
  }
  return { path, effective };
}

export function isRequired(q: QuestionDefinition, answers: Answers, ctx: RuleContext): boolean {
  if (!q.requiredRuleKey) return true;
  const rule = requiredRules[q.requiredRuleKey];
  if (!rule) throw new Error(`Unknown required rule: ${q.requiredRuleKey}`);
  return rule(answers, ctx);
}

/** Shape check per input type; protects against stale or malformed resumed values. */
export function valueMatchesType(q: QuestionDefinition, value: unknown): boolean {
  switch (q.type) {
    case 'singleChoice':
      return typeof value === 'string' && q.options.some((o) => o.value === value);
    case 'multiChoice':
      return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((v) => typeof v === 'string' && q.options.some((o) => o.value === v))
      );
    case 'shortText':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'currency':
      return typeof value === 'number' && Number.isInteger(value);
    case 'date':
      return typeof value === 'string' && isValidIsoDate(value);
    case 'relatedFields':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'documentUpload':
      return (
        typeof value === 'object' &&
        value !== null &&
        Array.isArray((value as { documentIds?: unknown }).documentIds)
      );
    case 'confirmImported':
      return typeof value === 'object' && value !== null && 'value' in value;
  }
}

function typeErrorKey(q: QuestionDefinition): string {
  switch (q.type) {
    case 'currency':
      return 'error.amountInvalid';
    case 'number':
      return 'error.wholeNumber';
    case 'date':
      return 'error.dateInvalid';
    default:
      return 'error.required';
  }
}

/** Returns a copy key for the error, or null when the record is acceptable. */
export function validateRecord(
  q: QuestionDefinition,
  record: AnswerRecord | undefined,
  answers: Answers,
  ctx: RuleContext,
): string | null {
  const required = isRequired(q, answers, ctx);
  if (!record) return required ? 'error.required' : null;
  switch (record.status) {
    case 'unknown':
      return q.allowUnknown ? null : 'error.required';
    case 'skipped':
      return q.allowSkip || !required ? null : 'error.required';
    case 'notApplicable':
      return null;
    case 'answered':
      break;
  }
  if (!valueMatchesType(q, record.value)) return typeErrorKey(q);
  if (q.type === 'shortText' && required && (record.value as string).trim() === '') return 'error.required';
  if (q.type === 'relatedFields') {
    const v = record.value as Record<string, string>;
    const missing = q.fields.some((f) => !f.optional && !(v[f.key] ?? '').trim());
    if (missing) return 'error.fieldsRequired';
  }
  if (q.type === 'documentUpload' && (record.value as { documentIds: string[] }).documentIds.length === 0)
    return 'error.uploadRequired';
  if (q.validationKey) {
    const validator = validators[q.validationKey];
    if (!validator) throw new Error(`Unknown validator: ${q.validationKey}`);
    const res = validator(record.value, q, ctx);
    if (res) return res.errorKey;
  }
  return null;
}

export function firstIncomplete(config: CheckupConfig, answers: Answers, ctx: RuleContext) {
  const { path, effective } = resolvePath(config, answers, ctx);
  return path.find((q) => validateRecord(q, effective[q.id], effective, ctx) !== null) ?? null;
}

export type SectionState = { id: string; titleKey: string; state: 'done' | 'current' | 'upcoming' };

/**
 * Section-based progress derived from the currently applicable path. Sections
 * with no visible questions are omitted so a branch never shows an empty step.
 */
export function sectionProgress(
  config: CheckupConfig,
  answers: Answers,
  ctx: RuleContext,
  currentQuestionId: string | null,
): SectionState[] {
  const { path } = resolvePath(config, answers, ctx);
  const visibleSections = config.sections.filter((s) => path.some((q) => q.sectionId === s.id));
  const currentSection = currentQuestionId
    ? path.find((q) => q.id === currentQuestionId)?.sectionId
    : undefined;
  const currentIdx = currentSection ? visibleSections.findIndex((s) => s.id === currentSection) : visibleSections.length;
  return visibleSections.map((s, i) => ({
    id: s.id,
    titleKey: s.titleKey,
    state: i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'upcoming',
  }));
}

/** Exclusive options ("None of these") clear the rest, and vice versa. */
export function toggleMultiOption(q: MultiChoiceQuestion, current: string[], value: string): string[] {
  const opt = q.options.find((o) => o.value === value);
  if (!opt) return current;
  if (current.includes(value)) return current.filter((v) => v !== value);
  if (opt.exclusive) return [value];
  const exclusives = new Set(q.options.filter((o) => o.exclusive).map((o) => o.value));
  return [...current.filter((v) => !exclusives.has(v)), value];
}

export type ConfirmedImportValue = {
  value: number | string;
  /** The imported value the user saw when confirming or editing. */
  importedValue: number | string;
  importedSourceDate: string;
};

/**
 * A later import must not silently overwrite a user-confirmed answer. When the
 * imported value has changed since confirmation, the question returns to review.
 */
export function importConflicts(config: CheckupConfig, answers: Answers, ctx: RuleContext): string[] {
  const { path, effective } = resolvePath(config, answers, ctx);
  return path
    .filter((q): q is ConfirmImportedQuestion => q.type === 'confirmImported')
    .filter((q) => {
      const rec = effective[q.id];
      const imported = ctx.imported[q.importedFieldKey];
      if (!rec || rec.status !== 'answered' || !imported) return false;
      const v = rec.value as ConfirmedImportValue;
      return v.importedValue !== imported.value || v.importedSourceDate !== imported.sourceDate;
    })
    .map((q) => q.id);
}

export type SubmissionField = {
  value: unknown;
  status: AnswerRecord['status'];
  source: AnswerRecord['source'];
  sourceDate?: string;
  confirmedAt?: string;
};

export type Submission = {
  checkupId: string;
  structureVersion: number;
  taxYear: number;
  fields: Record<string, SubmissionField>;
};

/**
 * Build the payload for the persistence service. Only answers on the current
 * visible path are included; stale branch answers stay in the local draft (so
 * flipping a controlling answer back restores them) but are never submitted.
 */
export function buildSubmission(config: CheckupConfig, answers: Answers, ctx: RuleContext): Submission {
  const { path, effective } = resolvePath(config, answers, ctx);
  const fields: Record<string, SubmissionField> = {};
  for (const q of path) {
    const rec = effective[q.id];
    if (!rec) continue;
    const value =
      q.type === 'confirmImported' && rec.status === 'answered'
        ? (rec.value as ConfirmedImportValue).value
        : rec.status === 'answered'
          ? rec.value
          : null;
    fields[q.fieldKey] = {
      value,
      status: rec.status,
      source: rec.source,
      ...(rec.sourceDate ? { sourceDate: rec.sourceDate } : {}),
      ...(rec.confirmedAt ? { confirmedAt: rec.confirmedAt } : {}),
    };
  }
  return { checkupId: config.id, structureVersion: config.structureVersion, taxYear: config.taxYear, fields };
}

export type SavedDraft = {
  checkupId: string;
  structureVersion: number;
  answers: Answers;
  currentQuestionId: string | null;
};

/**
 * Reconcile a resumed draft against the current configuration: drop answers for
 * removed questions or whose stored shape no longer fits the question type, and
 * resume at the saved step if it is still applicable, else the first gap.
 */
export function reconcileResume(config: CheckupConfig, saved: SavedDraft, ctx: RuleContext) {
  const byId = new Map(config.questions.map((q) => [q.id, q]));
  const answers: Answers = {};
  const dropped: string[] = [];
  for (const [id, rec] of Object.entries(saved.answers)) {
    const q = byId.get(id);
    if (!q || (rec.status === 'answered' && !valueMatchesType(q, rec.value))) {
      dropped.push(id);
      continue;
    }
    answers[id] = rec;
  }
  const { path } = resolvePath(config, answers, ctx);
  const gap = firstIncomplete(config, answers, ctx);
  const savedStillVisible = path.some((q) => q.id === saved.currentQuestionId);
  // Never resume past an unanswered required question that became applicable.
  const savedIdx = path.findIndex((q) => q.id === saved.currentQuestionId);
  const gapIdx = gap ? path.findIndex((q) => q.id === gap.id) : -1;
  const resumeAt =
    savedStillVisible && (gapIdx === -1 || savedIdx <= gapIdx) ? saved.currentQuestionId : gap?.id ?? null;
  return { answers, dropped, resumeAt, structureChanged: saved.structureVersion !== config.structureVersion };
}
