import { Icon } from '../../brand/Icon';
import { Mascot } from '../../brand/Mascot';
import { t } from '../content/en';
import type { SectionState } from '../engine/flow';
import type { CheckupController } from '../useCheckup';

/** Desktop-only companion column (hidden below 900px). */
export function WelcomeAside({ c }: { c: CheckupController }) {
  return (
    <div className="aside__stack">
      <div className="card aside-card">
        <div className="aside-card__head">
          <strong>{t('aside.welcome.title')}</strong>
          <span className="chip chip--amber">{t('aside.welcome.chip', { count: c.config.sections.length })}</span>
        </div>
        <ul className="aside-list">
          {c.config.sections.map((s) => (
            <li key={s.id}>
              <Icon name="check" size={16} className="aside-list__icon" />
              {t(s.titleKey)}
            </li>
          ))}
        </ul>
        <p className="fine-print" style={{ margin: 0 }}>
          {t('aside.welcome.note')}
        </p>
      </div>
      <p className="mascot-quote">
        <Mascot pose="greeting" size={64} />
        <span className="mascot-quote__text">“{t('welcome.mascotLine')}”</span>
      </p>
    </div>
  );
}

export function ProgressAside({ progress }: { progress: SectionState[] }) {
  return (
    <div className="aside__stack">
      <div className="card aside-card">
        <div className="aside-card__head">
          <strong>{t('shell.checkupName')}</strong>
        </div>
        <ol className="aside-list">
          {progress.map((s) => (
            <li key={s.id} data-state={s.state} aria-current={s.state === 'current' ? 'step' : undefined}>
              <span className="aside-list__dot" aria-hidden="true">
                {s.state === 'done' && <Icon name="check" size={14} />}
              </span>
              {t(s.titleKey)}
              <span className="sr-only">{s.state === 'done' ? ' (done)' : s.state === 'current' ? ' (current)' : ''}</span>
            </li>
          ))}
        </ol>
      </div>
      <Mascot pose="neutral" size={96} animate={false} />
    </div>
  );
}
