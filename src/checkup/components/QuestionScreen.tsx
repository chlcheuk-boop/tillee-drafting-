import { useEffect, useRef } from 'react';
import { Icon } from '../../brand/Icon';
import { Mascot } from '../../brand/Mascot';
import { t } from '../content/en';
import { formatAnswer, formatIsoDate } from '../engine/format';
import type { ConfirmedImportValue } from '../engine/flow';
import { formatCents } from '../engine/money';
import type { CheckupController } from '../useCheckup';
import { QuestionRenderer } from './QuestionRenderer';

/** One focused prompt: heading, help, input, why-we-ask, and one forward action. */
export function QuestionScreen({ c, id }: { c: CheckupController; id: string }) {
  const q = c.config.questions.find((x) => x.id === id)!;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const record = c.currentRecord(id);
  const error = c.errorFor?.id === id ? c.errorFor.key : null;
  const tax = { taxYear: c.config.taxYear };

  // Move focus to the new question after deliberate navigation.
  useEffect(() => headingRef.current?.focus(), [id]);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error, c.errorFor]);

  const idx = c.path.findIndex((x) => x.id === id);
  const prev = idx > 0 ? c.path[idx - 1] : undefined;
  // A bare "Yes"/"No" chip has no meaning out of context, so only richer answers are echoed.
  const prevIsBareChoice = prev?.type === 'singleChoice' && prev.layout === 'buttons';
  const prevAnswer = prev && prev.sectionId === q.sectionId && !prevIsBareChoice ? c.answers[prev.id] : undefined;

  const source = c.answers.payInfoSource?.value;
  const isManualFallback =
    (q.id === 'ytdWagesManual' || q.id === 'ytdWithholdingManual') && (source === 'payroll' || source === 'upload');

  const headingId = `${id}-heading`;
  const helpId = q.helpKey ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  const conflict = c.conflicts.includes(id) && q.type === 'confirmImported' ? c.ctx.imported[q.importedFieldKey] : undefined;
  const confirmed = c.answers[id]?.value as ConfirmedImportValue | undefined;

  return (
    <form
      className="step"
      key={id}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        c.continueFrom(id);
      }}
    >
      {prev && prevAnswer && (
        <p className="prev-answer">
          <span className="sr-only">Previous answer: </span>
          {formatAnswer(prev, prevAnswer)}
        </p>
      )}
      <h1 className="q-heading" id={headingId} ref={headingRef} tabIndex={-1}>
        {t(q.titleKey, tax)}
      </h1>
      {q.helpKey && (
        <p className="q-help" id={helpId}>
          {t(q.helpKey, tax)}
        </p>
      )}
      {isManualFallback && (
        <p className="notice" role="note">
          {t(source === 'payroll' ? 'fallback.payrollMissing' : 'fallback.documentMissing')}
        </p>
      )}
      {q.id === 'payInfoSource' && c.payroll !== 'loading' && c.payroll.status === 'unavailable' && (
        <p className="notice" role="note">
          {t('q.payInfoSource.payrollUnavailable')}
        </p>
      )}
      {conflict && confirmed && (
        <div className="conflict" role="alert" style={{ marginBottom: 16 }}>
          <p style={{ margin: 0 }}>
            {t('confirm.conflict', {
              newValue: formatCents(conflict.value as number),
              asOf: t('source.asOf', { date: formatIsoDate(conflict.sourceDate) }),
              oldValue: formatCents(confirmed.value as number),
            })}
          </p>
          <div className="secondary-actions" style={{ marginTop: 0 }}>
            <button type="button" className="btn btn--secondary btn--small" onClick={() => c.resolveConflict(id, 'useNew')}>
              {t('confirm.useNew')}
            </button>
            <button type="button" className="btn btn--secondary btn--small" onClick={() => c.resolveConflict(id, 'keepMine')}>
              {t('confirm.keepMine', { oldValue: formatCents(confirmed.value as number) })}
            </button>
          </div>
        </div>
      )}

      <QuestionRenderer
        q={q}
        record={record}
        onChange={(r) => c.setDraft(id, r)}
        labelledBy={headingId}
        describedBy={describedBy}
        invalid={!!error}
        taxYear={c.config.taxYear}
        c={c}
      />

      {error && (
        <p className="error" id={errorId} ref={errorRef} tabIndex={-1} role="alert">
          <Icon name="alert" size={18} />
          <span>{t(error, { ...tax, min: q.type === 'number' ? q.min ?? 0 : '', max: q.type === 'number' ? q.max ?? '' : '' })}</span>
        </p>
      )}

      {q.whyKey && (
        <details className="why">
          <summary>
            <Icon name="info" size={18} /> {t('common.whyWeAsk')}
          </summary>
          <div className="why__body">
            <Mascot pose="explaining" size={56} animate={false} />
            <p>“{t(q.whyKey, tax)}”</p>
          </div>
        </details>
      )}

      <div className="footer">
        <button type="submit" className="btn btn--primary">
          {t('common.continue')}
        </button>
        {q.allowUnknown && (
          <button type="button" className="btn btn--ghost" onClick={() => c.answerWithStatus(id, 'unknown')}>
            {t('common.notSure')}
          </button>
        )}
        {q.allowSkip && (
          <button type="button" className="btn btn--ghost" onClick={() => c.answerWithStatus(id, 'skipped')}>
            {t('common.skip')}
          </button>
        )}
        {q.type === 'documentUpload' && (
          <button type="button" className="btn btn--ghost" onClick={() => c.answerWithStatus(id, 'skipped')}>
            {t('upload.skipToManual')}
          </button>
        )}
      </div>
    </form>
  );
}
