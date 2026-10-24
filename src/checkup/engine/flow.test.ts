import { onboardingConfig as config } from '../config/onboarding';
import { en } from '../content/en';
import type { Answers, AnswerRecord, MultiChoiceQuestion } from '../types';
import type { RuleContext } from '../rules/registry';
import { visibilityRules, validators } from '../rules/registry';
import {
  buildSubmission,
  firstIncomplete,
  importConflicts,
  reconcileResume,
  resolvePath,
  sectionProgress,
  toggleMultiOption,
  validateRecord,
} from './flow';
import { parseCurrencyInput } from './money';
import { SaveTracker } from './saveTracker';

const ans = (questionId: string, value: unknown, extra: Partial<AnswerRecord> = {}): AnswerRecord => ({
  questionId,
  value,
  status: 'answered',
  source: 'user',
  ...extra,
});
const build = (...recs: AnswerRecord[]): Answers => Object.fromEntries(recs.map((r) => [r.questionId, r]));
const noImport: RuleContext = { taxYear: 2026, imported: {} };
const payrollCtx: RuleContext = {
  taxYear: 2026,
  imported: {
    ytdGrossWages: { value: 100, source: 'payroll', sourceDate: '2026-10-15', taxYear: 2026, sourceLabel: 'x' },
    ytdFederalWithholding: { value: 10, source: 'payroll', sourceDate: '2026-10-15', taxYear: 2026, sourceLabel: 'x' },
  },
};
const ids = (a: Answers, ctx = noImport) => resolvePath(config, a, ctx).path.map((q) => q.id);

describe('config integrity', () => {
  it('references only registered rules, validators and copy keys', () => {
    for (const q of config.questions) {
      if (q.visibilityRuleKey) expect(visibilityRules[q.visibilityRuleKey], q.id).toBeDefined();
      if (q.validationKey) expect(validators[q.validationKey], q.id).toBeDefined();
      const keys = [q.titleKey, q.helpKey, q.whyKey, ...('options' in q ? q.options.flatMap((o) => [o.labelKey, o.helpKey]) : [])];
      for (const k of keys) if (k) expect(en[k], `${q.id}: ${k}`).toBeDefined();
    }
  });
  it('has unique question ids and unique option values', () => {
    expect(new Set(config.questions.map((q) => q.id)).size).toBe(config.questions.length);
    for (const q of config.questions)
      if ('options' in q) expect(new Set(q.options.map((o) => o.value)).size).toBe(q.options.length);
  });
});

describe('branching', () => {
  it('simple path skips advanced follow-ups', () => {
    const a = build(
      ans('payInfoSource', 'manual'),
      ans('startedThisYear', 'no'),
      ans('expectedFilingStatus', 'single'),
      ans('hasDependents', 'no'),
      ans('otherIncomeTypes', ['none']),
    );
    const path = ids(a);
    expect(path).not.toContain('spouseWorks');
    expect(path).not.toContain('jobStartDate');
    expect(path).not.toContain('freelanceIncome');
    expect(path).toContain('ytdWagesManual');
    expect(path).not.toContain('confirmYtdWages');
  });

  it('shows follow-ups and excludes stale values when the controller changes', () => {
    let a = build(
      ans('expectedFilingStatus', 'marriedJoint'),
      ans('spouseWorks', 'yes'),
      ans('spouseIncome', 5_000_000),
    );
    expect(ids(a)).toEqual(expect.arrayContaining(['spouseWorks', 'spouseIncome']));
    a = { ...a, expectedFilingStatus: ans('expectedFilingStatus', 'single') };
    expect(ids(a)).not.toContain('spouseIncome');
    const sub = buildSubmission(config, a, noImport);
    expect(sub.fields).not.toHaveProperty('spouse_expected_annual_income_cents');
    expect(sub.fields).not.toHaveProperty('spouse_has_earned_income');
    // Draft still holds the values so flipping back restores them.
    a = { ...a, expectedFilingStatus: ans('expectedFilingStatus', 'marriedJoint') };
    expect(buildSubmission(config, a, noImport).fields.spouse_expected_annual_income_cents.value).toBe(5_000_000);
  });

  it('surfaces a newly required follow-up after an edit', () => {
    const a = build(
      ans('payInfoSource', 'manual'),
      ans('ytdWagesManual', 100),
      ans('ytdWithholdingManual', 10),
      ans('legalName', { first: 'Sam', last: 'Rivera' }),
      ans('startedThisYear', 'no'),
      ans('expectedFilingStatus', 'single'),
      ans('hasDependents', 'no'),
      ans('otherIncomeTypes', ['none']),
    );
    expect(firstIncomplete(config, a, noImport)).toBeNull();
    const edited = { ...a, otherIncomeTypes: ans('otherIncomeTypes', ['freelance']) };
    expect(firstIncomplete(config, edited, noImport)?.id).toBe('freelanceIncome');
  });

  it('uses imported data only for the selected source and matching tax year', () => {
    expect(ids(build(ans('payInfoSource', 'payroll')), payrollCtx)).toEqual(
      expect.arrayContaining(['confirmYtdWages', 'confirmYtdWithholding']),
    );
    const lastYear: RuleContext = {
      taxYear: 2026,
      imported: { ytdGrossWages: { ...payrollCtx.imported.ytdGrossWages!, taxYear: 2025 } },
    };
    const path = ids(build(ans('payInfoSource', 'payroll')), lastYear);
    expect(path).not.toContain('confirmYtdWages');
    expect(path).toContain('ytdWagesManual');
  });

  it('never traps a user when payroll is unavailable', () => {
    const path = ids(build(ans('payInfoSource', 'payroll')), noImport);
    expect(path).toEqual(expect.arrayContaining(['ytdWagesManual', 'ytdWithholdingManual']));
  });

  it('waits for an upload to settle before asking for manual fallbacks', () => {
    expect(ids(build(ans('payInfoSource', 'upload')))).not.toContain('ytdWagesManual');
    const skipped = build(ans('payInfoSource', 'upload'), { questionId: 'payStub', value: null, status: 'skipped', source: 'user' });
    expect(ids(skipped)).toContain('ytdWagesManual');
  });
});

describe('answer states', () => {
  const q = config.questions.find((x) => x.id === 'ytdWithholdingManual')!;
  const qWages = config.questions.find((x) => x.id === 'ytdWagesManual')!;
  it('distinguishes blank, zero and unknown', () => {
    expect(validateRecord(q, undefined, {}, noImport)).toBe('error.required');
    expect(validateRecord(q, ans(q.id, 0), {}, noImport)).toBeNull();
    expect(validateRecord(q, { questionId: q.id, value: null, status: 'unknown', source: 'user' }, {}, noImport)).toBeNull();
    expect(validateRecord(qWages, { questionId: qWages.id, value: null, status: 'unknown', source: 'user' }, {}, noImport)).toBe(
      'error.required',
    );
  });
  it('submits unknown as status, not as zero', () => {
    const a = build(ans('payInfoSource', 'manual'), { questionId: 'ytdWithholdingManual', value: null, status: 'unknown', source: 'user' });
    expect(buildSubmission(config, a, noImport).fields.ytd_federal_withholding_cents).toMatchObject({ value: null, status: 'unknown' });
  });
  it('parses currency without losing precision and rejects bad formats', () => {
    expect(parseCurrencyInput('')).toBeNull();
    expect(parseCurrencyInput('0')).toBe(0);
    expect(parseCurrencyInput('$1,234.5')).toBe(123450);
    expect(parseCurrencyInput('0.07')).toBe(7);
    expect(parseCurrencyInput('12.345')).toBe('invalid');
    expect(parseCurrencyInput('-5')).toBe('invalid');
    expect(parseCurrencyInput('-5', { allowNegative: true })).toBe(-500);
    expect(parseCurrencyInput('abc')).toBe('invalid');
  });
  it('validates real dates within the tax year', () => {
    const d = config.questions.find((x) => x.id === 'jobStartDate')!;
    expect(validateRecord(d, ans(d.id, '2026-02-30'), {}, noImport)).toBe('error.dateInvalid');
    expect(validateRecord(d, ans(d.id, '2025-03-01'), {}, noImport)).toBe('error.dateNotInTaxYear');
    expect(validateRecord(d, ans(d.id, '2026-03-01'), {}, noImport)).toBeNull();
  });
});

describe('multi-choice exclusivity', () => {
  const q = config.questions.find((x) => x.id === 'otherIncomeTypes') as MultiChoiceQuestion;
  it('"None" clears others and vice versa', () => {
    expect(toggleMultiOption(q, ['freelance', 'rental'], 'none')).toEqual(['none']);
    expect(toggleMultiOption(q, ['none'], 'freelance')).toEqual(['freelance']);
    expect(toggleMultiOption(q, ['freelance'], 'freelance')).toEqual([]);
  });
});

describe('imports', () => {
  it('flags a confirmed value when a newer import differs instead of overwriting it', () => {
    const confirmed = build(
      ans('payInfoSource', 'payroll'),
      ans('confirmYtdWages', { value: 120, importedValue: 100, importedSourceDate: '2026-10-15' }),
    );
    expect(importConflicts(config, confirmed, payrollCtx)).toEqual([]);
    const newer: RuleContext = {
      ...payrollCtx,
      imported: { ...payrollCtx.imported, ytdGrossWages: { ...payrollCtx.imported.ytdGrossWages!, value: 130, sourceDate: '2026-10-31' } },
    };
    expect(importConflicts(config, confirmed, newer)).toEqual(['confirmYtdWages']);
    // The user's edit is what gets submitted until they resolve it.
    expect(buildSubmission(config, confirmed, newer).fields.ytd_gross_wages_cents.value).toBe(120);
  });
});

describe('progress', () => {
  it('omits sections with no applicable questions and marks the current one', () => {
    const p = sectionProgress(config, build(ans('payInfoSource', 'manual')), noImport, 'legalName');
    expect(p.map((s) => s.state)).toEqual(['done', 'current', 'upcoming', 'upcoming']);
  });
});

describe('resume reconciliation', () => {
  it('drops answers for removed questions or changed shapes and resumes at a valid step', () => {
    const saved = {
      checkupId: config.id,
      structureVersion: 0,
      currentQuestionId: 'removedQuestion',
      answers: build(ans('payInfoSource', 'manual'), ans('removedQuestion', 'x'), ans('hasDependents', 'maybe')),
    };
    const r = reconcileResume(config, saved, noImport);
    expect(r.dropped.sort()).toEqual(['hasDependents', 'removedQuestion']);
    expect(r.resumeAt).toBe('ytdWagesManual');
    expect(r.structureChanged).toBe(true);
  });
  it('does not resume past a newly required question', () => {
    const saved = {
      checkupId: config.id,
      structureVersion: 1,
      currentQuestionId: 'otherIncomeTypes',
      answers: build(ans('payInfoSource', 'manual')),
    };
    expect(reconcileResume(config, saved, noImport).resumeAt).toBe('ytdWagesManual');
  });
});

describe('SaveTracker', () => {
  it('never lets an older response mark newer edits saved, and never shows a failure as saved', async () => {
    const resolvers: Array<(v: { savedAt: string }) => void> = [];
    const rejecters: Array<(e: Error) => void> = [];
    const statuses: string[] = [];
    const tracker = new SaveTracker<number>(
      () => new Promise((res, rej) => { resolvers.push(res); rejecters.push(rej); }),
      (s) => statuses.push(s.kind),
    );
    const first = tracker.submit(1);
    const second = tracker.submit(2);
    resolvers[0]({ savedAt: 't1' });
    await first;
    expect(tracker.status.kind).toBe('saving');
    expect(tracker.isCurrentSaved).toBe(false);
    rejecters[1](new Error('x'));
    await second;
    expect(tracker.status.kind).toBe('error');
    const retry = tracker.retry();
    resolvers[2]({ savedAt: 't3' });
    await retry;
    expect(tracker.status.kind).toBe('saved');
    expect(tracker.isCurrentSaved).toBe(true);
  });
});
