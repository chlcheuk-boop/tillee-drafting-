import { useRef, useState } from 'react';
import { Icon } from '../../../brand/Icon';
import type { DocumentRecord } from '../../adapters/contracts';
import { t } from '../../content/en';
import { formatIsoDate } from '../../engine/format';
import type { ConfirmedImportValue } from '../../engine/flow';
import { centsToInput, formatCents, parseCurrencyInput } from '../../engine/money';
import type { ImportedValue } from '../../rules/registry';
import type { ConfirmImportedQuestion, DocumentUploadQuestion } from '../../types';
import type { InputProps } from './types';

const TYPE_LABELS: Record<string, string> = { 'application/pdf': 'PDF', 'image/jpeg': 'JPG', 'image/png': 'PNG' };
const mb = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

type UploadProps = InputProps<DocumentUploadQuestion> & {
  documents: Record<string, DocumentRecord>;
  upload: (f: File, onCreated: (id: string) => void) => Promise<DocumentRecord>;
  remove: (id: string) => Promise<void>;
};

/**
 * Upload with real statuses only: a file is never shown as done until the
 * document service reports it processed.
 */
export function DocumentUploadInput({ q, record, onChange, documents, upload, remove, describedBy, labelledBy }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const files = useRef(new Map<string, File>());
  const ids = record?.status === 'answered' ? (record.value as { documentIds: string[] }).documentIds : [];
  const idsRef = useRef(ids);
  idsRef.current = ids;
  const types = q.accept.map((a) => TYPE_LABELS[a] ?? a).join(', ');

  const setIds = (next: string[]) =>
    onChange(next.length ? { questionId: q.id, value: { documentIds: next }, status: 'answered', source: 'document' } : undefined);

  const handle = async (file: File) => {
    setRejection(null);
    if (!q.accept.includes(file.type)) return setRejection(t('upload.status.rejected.type', { types }));
    if (file.size > q.maxBytes) return setRejection(t('upload.status.rejected.size', { size: mb(q.maxBytes) }));
    const rec = await upload(file, (id) => {
      files.current.set(id, file);
      setIds([...idsRef.current, id]);
    });
    // A failed transfer is not an answer; it stays listed with a retry.
    if (rec.status === 'failed') setIds(idsRef.current.filter((x) => x !== rec.id));
  };

  const shown = Object.values(documents);

  return (
    <div>
      <div
        className={`dropzone ${dragging ? 'dropzone--active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void handle(f);
        }}
      >
        <Icon name="upload" size={28} />
        <input
          ref={inputRef}
          id={`${q.id}-file`}
          type="file"
          className="sr-only"
          accept={q.accept.join(',')}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handle(f);
            e.target.value = '';
          }}
        />
        <button type="button" className="btn btn--secondary btn--small" onClick={() => inputRef.current?.click()}>
          {t('upload.choose')}
        </button>
        <span className="field__hint">{t('upload.drop')}</span>
        <span className="field__hint">{t('upload.limits', { types, size: mb(q.maxBytes) })}</span>
      </div>
      {rejection && (
        <p className="error" role="alert">
          <Icon name="alert" size={18} /> {rejection}
        </p>
      )}
      {shown.length > 0 && (
        <ul className="file-list" aria-live="polite">
          {shown.map((d) => (
            <li key={d.id} className="file">
              <Icon name="document" />
              <div className="file__info">
                <div className="file__name">{d.name}</div>
                <div
                  className={`file__status ${
                    d.status === 'processed' ? 'file__status--good' : ['failed', 'noTaxData'].includes(d.status) ? 'file__status--bad' : ''
                  }`}
                >
                  {['uploading', 'processing'].includes(d.status) && <span className="spinner" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />}
                  {d.status === 'processed' && <Icon name="check" size={16} />} {t(`upload.status.${d.status}`)}
                </div>
              </div>
              {d.status === 'failed' && files.current.get(d.id) && (
                <button
                  type="button"
                  className="btn btn--ghost btn--small"
                  onClick={() => {
                    const f = files.current.get(d.id)!;
                    void remove(d.id).then(() => handle(f));
                  }}
                >
                  <Icon name="refresh" size={16} /> {t('upload.retry')}
                </button>
              )}
              <button
                type="button"
                className="btn btn--ghost btn--small"
                aria-label={t('upload.remove', { name: d.name })}
                disabled={['uploading', 'processing'].includes(d.status)}
                onClick={() => {
                  setIds(idsRef.current.filter((x) => x !== d.id));
                  void remove(d.id);
                }}
              >
                <Icon name="x" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type ConfirmProps = InputProps<ConfirmImportedQuestion> & { imported: ImportedValue | undefined };

/**
 * Shows an imported value with its source and date, and asks the user to
 * confirm or correct it. Nothing is assumed correct until they choose.
 */
export function ConfirmImportedInput({ q, record, onChange, imported, describedBy, labelledBy, invalid, taxYear }: ConfirmProps) {
  const current = record?.status === 'answered' ? (record.value as ConfirmedImportValue) : undefined;
  const editing = record?.status === 'answered' && record.source === 'user';
  const [text, setText] = useState(() => (current && typeof current.value === 'number' ? centsToInput(current.value) : ''));
  if (!imported) return null;
  const fmt = (v: number | string) => (q.format === 'currency' ? formatCents(v as number) : String(v));
  const base = { importedValue: imported.value, importedSourceDate: imported.sourceDate };
  const now = () => new Date().toISOString();

  const accept = () =>
    onChange({
      questionId: q.id,
      value: { value: imported.value, ...base },
      status: 'answered',
      source: imported.source,
      sourceDate: imported.sourceDate,
      confirmedAt: now(),
    });
  const edit = (raw: string) => {
    setText(raw);
    const parsed = parseCurrencyInput(raw);
    onChange({
      questionId: q.id,
      value: { value: parsed === null || parsed === 'invalid' ? Number.NaN : parsed, ...base },
      status: 'answered',
      source: 'user',
      confirmedAt: now(),
    });
  };

  return (
    <div className="q-body">
      <div className="imported">
        <div className="imported__source">
          <Icon name={imported.source === 'payroll' ? 'link' : 'document'} size={16} />
          {t(imported.sourceLabel)} · {t('source.asOf', { date: formatIsoDate(imported.sourceDate) })}
          {q.periodKey && <> · {t(q.periodKey, { taxYear })}</>}
        </div>
        <div className="imported__amount">{fmt(imported.value)}</div>
      </div>
      <div role="radiogroup" aria-labelledby={labelledBy} aria-describedby={describedBy} aria-invalid={invalid || undefined} className="choices choices--buttons">
        <label className={`choice ${record && !editing ? 'choice--selected' : ''}`}>
          <input type="radio" name={q.id} checked={!!record && !editing} onChange={accept} />
          <span className="choice__text">
            <span className="choice__label">{t('confirm.looksRight')}</span>
          </span>
        </label>
        <label className={`choice ${editing ? 'choice--selected' : ''}`}>
          <input type="radio" name={q.id} checked={editing} onChange={() => edit(text || centsToInput(imported.value as number))} />
          <span className="choice__text">
            <span className="choice__label">{t('confirm.edit')}</span>
          </span>
        </label>
      </div>
      {editing && (
        <div className="field">
          <label htmlFor={`${q.id}-edit`}>{t('confirm.editLabel')}</label>
          <div className="input-affix">
            <span className="input-affix__prefix" aria-hidden="true">
              $
            </span>
            <input
              id={`${q.id}-edit`}
              className="input"
              inputMode="decimal"
              value={text}
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              onChange={(e) => edit(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
