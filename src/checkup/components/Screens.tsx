import { useEffect, useRef } from 'react';
import { Icon } from '../../brand/Icon';
import { Mascot } from '../../brand/Mascot';
import { t } from '../content/en';
import { formatAnswer, formatIsoDate } from '../engine/format';
import { validateRecord } from '../engine/flow';
import { formatCents } from '../engine/money';
import type { CheckupController, StepState } from '../useCheckup';

function useFocusHeading(dep: unknown) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), [dep]);
  return ref;
}

export function WelcomeScreen({ c }: { c: CheckupController }) {
  const h = useFocusHeading('welcome');
  return (
    <section className="hero step">
      <p className="eyebrow">{t('welcome.eyebrow', { taxYear: c.config.taxYear })}</p>
      <h1 className="q-heading" ref={h} tabIndex={-1}>
        {t('welcome.title')}
      </h1>
      <p className="q-help" style={{ margin: 0 }}>
        {t('welcome.body', { taxYear: c.config.taxYear })}
      </p>
      <ul className="hero__list">
        <li>{t('welcome.list.1')}</li>
        <li>{t('welcome.list.2')}</li>
        <li>{t('welcome.list.3')}</li>
      </ul>
      <p className="mascot-quote mascot-quote--compact">
        <Mascot pose="greeting" size={72} />
        <span className="mascot-quote__text">“{t('welcome.mascotLine')}”</span>
      </p>
      <p className="fine-print">{t('welcome.privacyNote')}</p>
      <div className="footer" style={{ width: '100%' }}>
        <button type="button" className="btn btn--primary" onClick={c.start}>
          {c.canResume ? t('welcome.resume') : t('welcome.cta')}
        </button>
      </div>
    </section>
  );
}

export function SectionIntroScreen({ c, sectionId }: { c: CheckupController; sectionId: string }) {
  const section = c.config.sections.find((s) => s.id === sectionId)!;
  const h = useFocusHeading(sectionId);
  return (
    <section className="hero step">
      <Mascot pose="celebrating" size={96} />
      <h1 className="q-heading" ref={h} tabIndex={-1}>
        {t(section.introKey!)}
      </h1>
      <div className="footer" style={{ width: '100%' }}>
        <button type="button" className="btn btn--primary" onClick={c.leaveIntro}>
          {t('section.intro.cta')}
        </button>
      </div>
    </section>
  );
}

export function ReviewScreen({ c }: { c: CheckupController }) {
  const h = useFocusHeading('review');
  const blocked = !!c.incomplete || c.conflicts.length > 0;
  return (
    <section className="step">
      <h1 className="q-heading" ref={h} tabIndex={-1}>
        {t('review.title')}
      </h1>
      <p className="q-help">{t('review.body')}</p>
      {c.config.sections.map((s) => {
        const qs = c.path.filter((q) => q.sectionId === s.id);
        if (!qs.length) return null;
        return (
          <div className="review-section" key={s.id}>
            <h2>{t(s.titleKey)}</h2>
            <dl className="review-list">
              {qs.map((q) => {
                const rec = c.answers[q.id];
                const issue = validateRecord(q, rec, c.answers, c.ctx) !== null || c.conflicts.includes(q.id);
                const title = t(q.titleKey, { taxYear: c.config.taxYear });
                return (
                  <div className={`review-row ${issue ? 'review-row--issue' : ''}`} key={q.id}>
                    <dt>{title}</dt>
                    <dd>
                      {issue && <Icon name="alert" size={16} />} {issue ? t('review.unresolved') + ': ' : ''}
                      {formatAnswer(q, rec)}
                    </dd>
                    {rec?.source && rec.source !== 'user' && rec.sourceDate && (
                      <dd className="review-row__meta">
                        {t(rec.source === 'payroll' ? 'source.payroll' : 'source.document')} ·{' '}
                        {t('source.asOf', { date: formatIsoDate(rec.sourceDate) })}
                      </dd>
                    )}
                    <dd className="review-row__edit">
                      <button type="button" className="btn btn--ghost btn--small" onClick={() => c.editFromReview(q.id)}>
                        {t('common.edit')}
                        <span className="sr-only">: {title}</span>
                      </button>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        );
      })}
      {blocked && (
        <p className="notice" role="note">
          {t('review.incomplete')}
        </p>
      )}
      <div className="footer">
        <button
          type="button"
          className="btn btn--primary"
          aria-disabled={blocked || undefined}
          onClick={() => {
            if (blocked) {
              const target = c.conflicts[0] ?? c.incomplete?.id;
              if (target) c.editFromReview(target);
              return;
            }
            void c.complete();
          }}
        >
          {t('review.cta')}
        </button>
      </div>
    </section>
  );
}

const STEP_ICON: Record<StepState, JSX.Element | null> = {
  pending: null,
  active: <span className="spinner" aria-hidden="true" />,
  done: <Icon name="check" size={16} />,
  failed: <Icon name="x" size={16} />,
  skipped: null,
};

export function ProcessingScreen({ c }: { c: CheckupController }) {
  const h = useFocusHeading('processing');
  const failed = c.steps.save === 'failed';
  const rows: Array<[keyof typeof c.steps, string]> = [
    ['save', 'processing.step.save'],
    ['documents', 'processing.step.documents'],
    ['estimate', 'processing.step.estimate'],
  ];
  return (
    <section className="step">
      <Mascot pose={failed ? 'supportive' : 'thinking'} size={96} />
      <h1 className="q-heading" ref={h} tabIndex={-1}>
        {t(failed ? 'processing.failedTitle' : 'processing.title')}
      </h1>
      <ol className="steps" aria-live="polite">
        {rows
          .filter(([k]) => c.steps[k] !== 'skipped')
          .map(([k, key]) => (
            <li key={k} data-state={c.steps[k]}>
              <span className="steps__icon">{STEP_ICON[c.steps[k]]}</span>
              {t(key)}
              <span className="sr-only">: {c.steps[k]}</span>
            </li>
          ))}
      </ol>
      {failed && (
        <>
          <p className="error" role="alert">
            <Icon name="alert" size={18} /> {t('processing.failed.save')}
          </p>
          <div className="footer">
            <button type="button" className="btn btn--primary" onClick={() => void c.complete()}>
              {t('common.retry')}
            </button>
            <button type="button" className="btn btn--ghost" onClick={c.back}>
              {t('result.editAnswers')}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export function ResultScreen({ c }: { c: CheckupController }) {
  const h = useFocusHeading('result');
  const r = c.result;
  return (
    <section className="step">
      <Mascot pose={r?.status === 'error' ? 'supportive' : 'reassuring'} size={96} />
      <h1 className="q-heading" ref={h} tabIndex={-1}>
        {t('result.saved.title')}
      </h1>
      <div className="result-card" aria-live="polite">
        {!r && (
          <p style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="spinner" aria-hidden="true" /> {t('processing.step.estimate')}
          </p>
        )}
        {r?.status === 'unavailable' && <p style={{ margin: 0 }}>{t('result.unavailable.body')}</p>}
        {r?.status === 'processing' && <p style={{ margin: 0 }}>{t('result.processing.body')}</p>}
        {r?.status === 'missingInputs' && (
          <>
            <p style={{ marginTop: 0 }}>{t('result.missing.body')}</p>
            <ul>
              {r.missingCopyKeys.map((k) => (
                <li key={k}>{t(k)}</li>
              ))}
            </ul>
          </>
        )}
        {r?.status === 'error' && (
          <>
            <p style={{ marginTop: 0 }}>{t('result.error.body')}</p>
            <button type="button" className="btn btn--secondary btn--small" onClick={() => void c.retryEstimate()}>
              <Icon name="refresh" size={16} /> {t('common.retry')}
            </button>
          </>
        )}
        {r?.status === 'demo' && (
          <>
            <span className="demo-badge">{t('result.demo.label')}</span>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 8px' }}>
              {r.direction === 'onTrack'
                ? t('result.demo.onTrack')
                : t(r.direction === 'mayOwe' ? 'result.demo.mayOwe' : 'result.demo.mayGetRefund', {
                    low: formatCents(r.rangeCents[0]),
                    high: formatCents(r.rangeCents[1]),
                  })}
            </p>
            <p className="fine-print" style={{ margin: 0 }}>
              {t('result.demo.caveat', { asOf: t('source.asOf', { date: formatIsoDate(r.asOf) }) })}
            </p>
          </>
        )}
      </div>
      <p className="fine-print">{t('result.disclaimer')}</p>
      <div className="footer">
        {/* PLACEHOLDER: route to the existing dashboard / next-step flow. */}
        <a className="btn btn--primary" href="#checkup" onClick={(e) => e.preventDefault()} aria-disabled="true">
          {t('result.next')}
        </a>
        <button type="button" className="btn btn--ghost" onClick={c.goToReview}>
          {t('result.editAnswers')}
        </button>
      </div>
    </section>
  );
}
