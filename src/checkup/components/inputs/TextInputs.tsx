import { useState } from 'react';
import { t } from '../../content/en';
import { centsToInput, parseCurrencyInput } from '../../engine/money';
import type {
  AnswerRecord,
  CurrencyQuestion,
  DateQuestion,
  NumberQuestion,
  RelatedFieldsQuestion,
  ShortTextQuestion,
} from '../../types';
import type { InputProps } from './types';

const answered = (q: { id: string }, value: unknown): AnswerRecord => ({
  questionId: q.id,
  value,
  status: 'answered',
  source: 'user',
});

export function ShortTextInput({ q, record, onChange, describedBy, invalid }: InputProps<ShortTextQuestion>) {
  const value = record?.status === 'answered' ? (record.value as string) : '';
  return (
    <div className="field">
      <label htmlFor={`${q.id}-input`}>{t(q.labelKey)}</label>
      <input
        id={`${q.id}-input`}
        className="input"
        type="text"
        autoComplete={q.autoComplete}
        maxLength={q.maxLength}
        value={value}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value === '' ? undefined : answered(q, e.target.value))}
      />
    </div>
  );
}

export function RelatedFieldsInput({ q, record, onChange, describedBy, invalid, labelledBy }: InputProps<RelatedFieldsQuestion>) {
  const value = record?.status === 'answered' ? (record.value as Record<string, string>) : {};
  return (
    <div role="group" aria-labelledby={labelledBy} className="fields-row">
      {q.fields.map((f) => (
        <div className="field" key={f.key}>
          <label htmlFor={`${q.id}-${f.key}`}>{t(f.labelKey)}</label>
          <input
            id={`${q.id}-${f.key}`}
            className="input"
            type="text"
            autoComplete={f.autoComplete}
            value={value[f.key] ?? ''}
            aria-describedby={describedBy}
            aria-invalid={(invalid && !(value[f.key] ?? '').trim()) || undefined}
            onChange={(e) => {
              const next = { ...value, [f.key]: e.target.value };
              const empty = Object.values(next).every((v) => v === '');
              onChange(empty ? undefined : answered(q, next));
            }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Currency entry: text input with numeric keyboard (inputMode="decimal"),
 * stored as integer cents. Blank stays blank; "0" is a real zero.
 */
export function CurrencyInput({ q, record, onChange, describedBy, invalid, taxYear }: InputProps<CurrencyQuestion>) {
  const allowNegative = q.validationKey === 'signedAmount';
  const [text, setText] = useState(() =>
    record?.status === 'answered' && typeof record.value === 'number' ? centsToInput(record.value) : '',
  );
  return (
    <div className="field">
      <label htmlFor={`${q.id}-input`}>
        {t('input.amountLabel')} <span className="field__hint">· {t(q.periodKey, { taxYear })}</span>
      </label>
      <div className="input-affix">
        <span className="input-affix__prefix" aria-hidden="true">
          $
        </span>
        <input
          id={`${q.id}-input`}
          className="input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            setText(e.target.value);
            const parsed = parseCurrencyInput(e.target.value, { allowNegative });
            onChange(parsed === null ? undefined : answered(q, parsed === 'invalid' ? Number.NaN : parsed));
          }}
        />
      </div>
      {q.exampleKey && <p className="example">{t(q.exampleKey)}</p>}
    </div>
  );
}

export function NumberInput({ q, record, onChange, describedBy, invalid }: InputProps<NumberQuestion>) {
  const [text, setText] = useState(() =>
    record?.status === 'answered' && typeof record.value === 'number' ? String(record.value) : '',
  );
  return (
    <div className="field">
      <label htmlFor={`${q.id}-input`}>{t('input.countLabel', { unit: t(q.unitKey) })}</label>
      <input
        id={`${q.id}-input`}
        className="input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        value={text}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        style={{ maxWidth: 160 }}
        onChange={(e) => {
          const raw = e.target.value.trim();
          setText(e.target.value);
          if (raw === '') return onChange(undefined);
          onChange(answered(q, /^\d+$/.test(raw) ? Number(raw) : Number.NaN));
        }}
      />
    </div>
  );
}

/**
 * Three-part date entry. Avoids calendar-only pickers so far-past dates are
 * quick to type and the format is never ambiguous.
 */
export function DateInput({ q, record, onChange, describedBy, invalid, labelledBy }: InputProps<DateQuestion>) {
  const initial = record?.status === 'answered' && typeof record.value === 'string' ? record.value.split('-') : ['', '', ''];
  const [parts, setParts] = useState({ y: initial[0] ?? '', m: initial[1] ?? '', d: initial[2] ?? '' });
  const update = (key: 'y' | 'm' | 'd', v: string) => {
    const next = { ...parts, [key]: v.replace(/\D/g, '') };
    setParts(next);
    if (!next.y && !next.m && !next.d) return onChange(undefined);
    const complete = next.y.length === 4 && next.m && next.d;
    const iso = complete ? `${next.y}-${next.m.padStart(2, '0')}-${next.d.padStart(2, '0')}` : 'incomplete';
    onChange(answered(q, iso));
  };
  const field = (key: 'm' | 'd' | 'y', labelKey: string, max: number, autoComplete?: string) => (
    <div className="field">
      <label htmlFor={`${q.id}-${key}`}>{t(labelKey)}</label>
      <input
        id={`${q.id}-${key}`}
        className="input"
        type="text"
        inputMode="numeric"
        maxLength={max}
        autoComplete={autoComplete}
        placeholder={key === 'y' ? 'YYYY' : key === 'm' ? 'MM' : 'DD'}
        value={parts[key]}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onChange={(e) => update(key, e.target.value)}
      />
    </div>
  );
  return (
    <fieldset aria-labelledby={labelledBy}>
      <legend className="sr-only">{t('input.dateHint')}</legend>
      <div className="date-row">
        {field('m', 'input.month', 2)}
        {field('d', 'input.day', 2)}
        {field('y', 'input.year', 4)}
      </div>
    </fieldset>
  );
}
