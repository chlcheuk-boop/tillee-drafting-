import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CheckupServices, DocumentRecord, EstimateResult, PayrollImportResult } from './adapters/contracts';
import type { ImportedFields, RuleContext } from './rules/registry';
import type { AnswerRecord, Answers, CheckupConfig, QuestionDefinition } from './types';
import {
  buildSubmission,
  firstIncomplete,
  importConflicts,
  reconcileResume,
  resolvePath,
  sectionProgress,
  validateRecord,
  type ConfirmedImportValue,
} from './engine/flow';
import { SaveTracker, type SaveStatus } from './engine/saveTracker';

export type View =
  | { kind: 'loading' }
  | { kind: 'welcome' }
  | { kind: 'intro'; sectionId: string; nextId: string }
  | { kind: 'question'; id: string }
  | { kind: 'review' }
  | { kind: 'processing' }
  | { kind: 'result' };

export type StepState = 'pending' | 'active' | 'done' | 'failed' | 'skipped';
export type ProcessingSteps = { save: StepState; documents: StepState; estimate: StepState };

const newKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `k_${Date.now()}_${Math.random()}`;

/**
 * Flow controller. Owns navigation, draft vs committed answers and calls to
 * services. Contains no wording and no tax math.
 */
export function useCheckup(config: CheckupConfig, services: CheckupServices) {
  const [view, setView] = useState<View>({ kind: 'loading' });
  const [history, setHistory] = useState<View[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [pending, setPending] = useState<Record<string, AnswerRecord | undefined>>({});
  const [errorFor, setErrorFor] = useState<{ id: string; key: string } | null>(null);
  const [returnToReview, setReturnToReview] = useState(false);
  const [seenIntros, setSeenIntros] = useState<string[]>([]);
  const [canResume, setCanResume] = useState<string | null>(null);
  const [payroll, setPayroll] = useState<PayrollImportResult | 'loading'>('loading');
  const [documents, setDocuments] = useState<Record<string, DocumentRecord>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: 'idle' });
  const [steps, setSteps] = useState<ProcessingSteps>({ save: 'pending', documents: 'pending', estimate: 'pending' });
  const [completion, setCompletion] = useState<'none' | 'failed' | 'saved'>('none');
  const [result, setResult] = useState<EstimateResult | null>(null);

  const completingRef = useRef(false);
  const idempotencyKey = useRef(newKey());
  const tracker = useMemo(
    () => new SaveTracker(services.persistence.saveDraft.bind(services.persistence), setSaveStatus),
    [services],
  );

  // ----- Rule context: imported values for the selected source -----------
  const ctx: RuleContext = useMemo(() => {
    const source = answers.payInfoSource?.status === 'answered' ? answers.payInfoSource.value : null;
    let imported: ImportedFields = {};
    if (source === 'payroll' && payroll !== 'loading' && payroll.status === 'connected') imported = payroll.fields;
    if (source === 'upload' && answers.payStub?.status === 'answered') {
      const ids = (answers.payStub.value as { documentIds: string[] }).documentIds;
      for (const id of ids) {
        const d = documents[id];
        if (d?.status === 'processed' && d.extracted) imported = { ...imported, ...d.extracted };
      }
    }
    return { taxYear: config.taxYear, imported };
  }, [answers, payroll, documents, config.taxYear]);

  const { path, effective } = useMemo(() => resolvePath(config, answers, ctx), [config, answers, ctx]);
  const conflicts = useMemo(() => importConflicts(config, answers, ctx), [config, answers, ctx]);

  // ----- Load + resume ----------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    services.payroll.fetch().then((r) => !cancelled && setPayroll(r)).catch(() => !cancelled && setPayroll({ status: 'unavailable' }));
    services.persistence
      .loadDraft()
      .then((saved) => {
        if (cancelled) return;
        if (saved && saved.checkupId === config.id) {
          const r = reconcileResume(config, saved, { taxYear: config.taxYear, imported: {} });
          setAnswers(r.answers);
          setCanResume(r.resumeAt ?? 'review');
          // Restore document metadata for any referenced uploads.
          const ids = (r.answers.payStub?.value as { documentIds?: string[] } | undefined)?.documentIds ?? [];
          const restored: Record<string, DocumentRecord> = {};
          for (const id of ids) {
            const d = services.documents.get(id);
            if (d) restored[id] = d;
          }
          setDocuments(restored);
        }
        setView({ kind: 'welcome' });
      })
      .catch(() => !cancelled && setView({ kind: 'welcome' }));
    return () => {
      cancelled = true;
    };
  }, [config, services]);

  // ----- Navigation -------------------------------------------------------
  const go = useCallback((next: View) => {
    setView((cur) => {
      setHistory((h) => [...h, cur]);
      return next;
    });
    setErrorFor(null);
  }, []);

  const back = useCallback(() => {
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (prev) setView(prev);
      return h.slice(0, -1);
    });
    setErrorFor(null);
  }, []);

  const questionView = useCallback(
    (q: QuestionDefinition, fromSection: string | null): View => {
      const section = config.sections.find((s) => s.id === q.sectionId);
      if (section?.introKey && fromSection && fromSection !== q.sectionId && !seenIntros.includes(section.id)) {
        return { kind: 'intro', sectionId: section.id, nextId: q.id };
      }
      return { kind: 'question', id: q.id };
    },
    [config.sections, seenIntros],
  );

  const start = useCallback(() => {
    const target = canResume && canResume !== 'review' ? canResume : null;
    if (canResume === 'review') return go({ kind: 'review' });
    const first = target ? path.find((q) => q.id === target) : path[0];
    if (first) go({ kind: 'question', id: first.id });
  }, [canResume, path, go]);

  const leaveIntro = useCallback(() => {
    if (view.kind !== 'intro') return;
    setSeenIntros((s) => [...s, view.sectionId]);
    setView({ kind: 'question', id: view.nextId });
  }, [view]);

  // ----- Answers ----------------------------------------------------------
  const currentRecord = (id: string) => pending[id] ?? answers[id];

  const setDraft = useCallback((id: string, rec: AnswerRecord | undefined) => {
    setPending((p) => ({ ...p, [id]: rec }));
    setErrorFor((e) => (e?.id === id ? null : e));
  }, []);

  const commitAndAdvance = useCallback(
    (q: QuestionDefinition, rec: AnswerRecord | undefined) => {
      // Uploads must finish processing before we treat them as answered.
      if (q.type === 'documentUpload' && rec?.status === 'answered') {
        const ids = (rec.value as { documentIds: string[] }).documentIds;
        if (ids.some((id) => ['uploading', 'processing'].includes(documents[id]?.status ?? ''))) {
          setErrorFor({ id: q.id, key: 'upload.waiting' });
          return;
        }
      }
      if (q.type === 'confirmImported' && !rec) {
        setErrorFor({ id: q.id, key: 'error.confirmChoice' });
        return;
      }
      const err = validateRecord(q, rec, effective, ctx);
      if (err) {
        setErrorFor({ id: q.id, key: err });
        return;
      }
      const next: Answers = { ...answers };
      if (rec) next[q.id] = rec;
      else delete next[q.id];
      setAnswers(next);
      setPending((p) => ({ ...p, [q.id]: undefined }));
      if (completion === 'saved') {
        // Edits after completion need a fresh completion with a new key.
        setCompletion('none');
        idempotencyKey.current = newKey();
      }

      // Compute the next step against the updated answers. Imports from
      // documents depend on `documents`, already reflected in ctx via answers.
      const nextCtx = { ...ctx };
      if (q.id === 'payInfoSource' || q.id === 'payStub') nextCtx.imported = recomputeImported(next);
      const { path: nextPath } = resolvePath(config, next, nextCtx);
      let target: View;
      const gap = firstIncomplete(config, next, nextCtx);
      if (returnToReview) {
        target = gap ? { kind: 'question', id: gap.id } : { kind: 'review' };
      } else {
        const idx = nextPath.findIndex((x) => x.id === q.id);
        const following = nextPath[idx + 1];
        target = following ? questionView(following, q.sectionId) : gap ? { kind: 'question', id: gap.id } : { kind: 'review' };
      }
      void tracker.submit({
        checkupId: config.id,
        structureVersion: config.structureVersion,
        answers: next,
        currentQuestionId: target.kind === 'question' ? target.id : null,
      });
      go(target);

      function recomputeImported(a: Answers): ImportedFields {
        const src = a.payInfoSource?.status === 'answered' ? a.payInfoSource.value : null;
        if (src === 'payroll' && payroll !== 'loading' && payroll.status === 'connected') return payroll.fields;
        if (src === 'upload' && a.payStub?.status === 'answered') {
          let imp: ImportedFields = {};
          for (const id of (a.payStub.value as { documentIds: string[] }).documentIds) {
            const d = documents[id];
            if (d?.status === 'processed' && d.extracted) imp = { ...imp, ...d.extracted };
          }
          return imp;
        }
        return {};
      }
    },
    [answers, effective, ctx, config, returnToReview, questionView, tracker, go, documents, payroll, completion],
  );

  const continueFrom = useCallback(
    (id: string) => {
      const q = config.questions.find((x) => x.id === id)!;
      commitAndAdvance(q, currentRecord(id));
    },
    [config, commitAndAdvance, pending, answers],
  );

  const answerWithStatus = useCallback(
    (id: string, status: 'unknown' | 'skipped') => {
      const q = config.questions.find((x) => x.id === id)!;
      commitAndAdvance(q, { questionId: id, value: null, status, source: 'user' });
    },
    [config, commitAndAdvance],
  );

  const editFromReview = useCallback(
    (id: string) => {
      setReturnToReview(true);
      go({ kind: 'question', id });
    },
    [go],
  );

  /** Resolve an import conflict: take the newer import, or keep the user's value. */
  const resolveConflict = useCallback(
    (id: string, choice: 'useNew' | 'keepMine') => {
      const q = config.questions.find((x) => x.id === id);
      if (!q || q.type !== 'confirmImported') return;
      const imp = ctx.imported[q.importedFieldKey];
      const rec = answers[id];
      if (!imp || !rec) return;
      const prev = rec.value as ConfirmedImportValue;
      const value: ConfirmedImportValue = {
        value: choice === 'useNew' ? imp.value : prev.value,
        importedValue: imp.value,
        importedSourceDate: imp.sourceDate,
      };
      const next = {
        ...answers,
        [id]: {
          ...rec,
          value,
          source: choice === 'useNew' ? imp.source : rec.source,
          sourceDate: choice === 'useNew' ? imp.sourceDate : rec.sourceDate,
          confirmedAt: new Date().toISOString(),
        },
      };
      setAnswers(next);
      void tracker.submit({ checkupId: config.id, structureVersion: config.structureVersion, answers: next, currentQuestionId: null });
    },
    [answers, config, ctx, tracker],
  );

  // ----- Documents --------------------------------------------------------
  const uploadFile = useCallback(
    async (file: File, onCreated: (id: string) => void) => {
      let announced = false;
      return services.documents.upload(file, (r) => {
        setDocuments((d) => ({ ...d, [r.id]: r }));
        if (!announced) {
          announced = true;
          onCreated(r.id);
        }
      });
    },
    [services],
  );
  const removeFile = useCallback(
    async (id: string) => {
      await services.documents.remove(id);
      setDocuments((d) => {
        const { [id]: _removed, ...rest } = d;
        return rest;
      });
    },
    [services],
  );

  // ----- Completion -------------------------------------------------------
  const complete = useCallback(async () => {
    if (completingRef.current) return; // rapid double-submit guard
    if (firstIncomplete(config, answers, ctx) || conflicts.length) return;
    completingRef.current = true;
    const hasDocs = answers.payInfoSource?.value === 'upload' && answers.payStub?.status === 'answered';
    setSteps({ save: 'active', documents: hasDocs ? 'pending' : 'skipped', estimate: 'pending' });
    setResult(null);
    go({ kind: 'processing' });
    const submission = buildSubmission(config, answers, ctx);
    try {
      await services.persistence.complete(submission, idempotencyKey.current);
    } catch {
      setSteps((s) => ({ ...s, save: 'failed' }));
      setCompletion('failed');
      completingRef.current = false;
      return;
    }
    setCompletion('saved');
    setSteps((s) => ({ ...s, save: 'done', documents: hasDocs ? 'done' : 'skipped', estimate: 'active' }));
    let res: EstimateResult;
    try {
      res = await services.estimate.request(submission);
    } catch {
      res = { status: 'error' };
    }
    setSteps((s) => ({ ...s, estimate: res.status === 'error' ? 'failed' : 'done' }));
    setResult(res);
    completingRef.current = false;
    // No artificial delay: move on as soon as the real work is done.
    setView({ kind: 'result' });
  }, [config, answers, ctx, conflicts, services, go]);

  const retryEstimate = useCallback(async () => {
    if (completingRef.current) return;
    completingRef.current = true;
    setResult(null);
    try {
      setResult(await services.estimate.request(buildSubmission(config, answers, ctx)));
    } catch {
      setResult({ status: 'error' });
    }
    completingRef.current = false;
  }, [services, config, answers, ctx]);

  const progress = useMemo(
    () => sectionProgress(config, answers, ctx, view.kind === 'question' ? view.id : view.kind === 'intro' ? view.nextId : null),
    [config, answers, ctx, view],
  );

  return {
    config,
    view,
    path,
    answers: effective,
    allAnswers: answers,
    ctx,
    payroll,
    documents,
    saveStatus,
    retrySave: () => tracker.retry(),
    progress,
    errorFor,
    canResume: canResume !== null,
    conflicts,
    steps,
    completion,
    result,
    incomplete: firstIncomplete(config, answers, ctx),
    canGoBack: history.length > 0,
    currentRecord,
    setDraft,
    continueFrom,
    answerWithStatus,
    start,
    leaveIntro,
    back,
    editFromReview,
    goToReview: () => {
      setReturnToReview(true);
      go({ kind: 'review' });
    },
    resolveConflict,
    uploadFile,
    removeFile,
    complete,
    retryEstimate,
  };
}

export type CheckupController = ReturnType<typeof useCheckup>;
