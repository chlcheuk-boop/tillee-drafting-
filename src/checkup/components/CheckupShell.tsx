import type { ReactNode } from 'react';
import { Icon } from '../../brand/Icon';
import { Wordmark } from '../../brand/Mascot';
import { t } from '../content/en';
import type { SectionState } from '../engine/flow';
import type { SaveStatus } from '../engine/saveTracker';

type Props = {
  children: ReactNode;
  aside?: ReactNode;
  progress?: SectionState[];
  saveStatus: SaveStatus;
  onRetrySave: () => void;
  onBack?: () => void;
};

/** Persistent frame: brand, Back, save status and section progress. */
export function CheckupShell({ children, aside, progress, saveStatus, onRetrySave, onBack }: Props) {
  const currentIdx = progress?.findIndex((s) => s.state === 'current') ?? -1;
  const current = progress?.[currentIdx];
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__inner">
          {onBack ? (
            <button type="button" className="btn btn--ghost btn--small" onClick={onBack}>
              <Icon name="back" size={18} /> {t('common.back')}
            </button>
          ) : (
            <span className="topbar__brand">
              <Wordmark />
            </span>
          )}
          <span className="topbar__spacer" />
          <SaveIndicator status={saveStatus} onRetry={onRetrySave} />
        </div>
        {progress && progress.length > 0 && current && (
          <nav className="progress" aria-label={t('shell.progressLabel')}>
            <ol className="progress__bars">
              {progress.map((s) => (
                <li key={s.id} className={`progress__bar progress__bar--${s.state}`} aria-current={s.state === 'current' ? 'step' : undefined}>
                  <span className="sr-only">
                    {t(s.titleKey)}
                    {s.state === 'done' ? ' (done)' : ''}
                  </span>
                </li>
              ))}
            </ol>
            <p className="progress__label" aria-hidden="true">
              {t('shell.sectionOf', { current: currentIdx + 1, total: progress.length, title: t(current.titleKey) })}
            </p>
          </nav>
        )}
      </header>
      <main className={`main ${aside ? 'main--with-aside' : ''}`}>
        <div className="stage">{children}</div>
        {aside && <div className="aside">{aside}</div>}
      </main>
    </div>
  );
}

function SaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  return (
    <div className={`save-status ${status.kind === 'error' ? 'save-status--error' : ''}`} role="status" aria-live="polite">
      {status.kind === 'saving' && t('save.saving')}
      {status.kind === 'saved' && (
        <>
          <Icon name="check" size={16} /> {t('save.saved')}
        </>
      )}
      {status.kind === 'error' && (
        <>
          <Icon name="alert" size={16} />
          <span>{t('save.error')}</span>
          <button type="button" className="link-btn" onClick={onRetry}>
            {t('common.retry')}
          </button>
        </>
      )}
    </div>
  );
}
