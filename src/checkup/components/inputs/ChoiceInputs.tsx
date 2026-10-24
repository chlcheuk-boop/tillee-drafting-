import { Icon } from '../../../brand/Icon';
import { t } from '../../content/en';
import { toggleMultiOption } from '../../engine/flow';
import type { AnswerRecord, ChoiceOption, MultiChoiceQuestion, SingleChoiceQuestion } from '../../types';
import type { InputProps } from './types';

function OptionBody({ opt, kind, selected }: { opt: ChoiceOption; kind: 'radio' | 'check'; selected: boolean }) {
  return (
    <>
      {opt.iconKey && (
        <span className="choice__icon">
          <Icon name={opt.iconKey} size={22} />
        </span>
      )}
      <span className="choice__text">
        <span className="choice__label">{t(opt.labelKey)}</span>
        {opt.helpKey && <span className="choice__help">{t(opt.helpKey)}</span>}
      </span>
      <span className={`choice__mark choice__mark--${kind}`} aria-hidden="true">
        {selected && <Icon name="check" size={16} />}
      </span>
    </>
  );
}

export function SingleChoiceInput({ q, record, onChange, describedBy, labelledBy, invalid }: InputProps<SingleChoiceQuestion>) {
  const value = record?.status === 'answered' ? (record.value as string) : undefined;
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className={`choices ${q.layout === 'buttons' ? 'choices--buttons' : ''}`}
    >
      {q.options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label key={opt.value} className={`choice ${selected ? 'choice--selected' : ''}`}>
            <input
              type="radio"
              name={q.id}
              value={opt.value}
              checked={selected}
              onChange={() => onChange({ questionId: q.id, value: opt.value, status: 'answered', source: 'user' })}
            />
            <OptionBody opt={opt} kind="radio" selected={selected} />
          </label>
        );
      })}
    </div>
  );
}

export function MultiChoiceInput({ q, record, onChange, describedBy, labelledBy, invalid }: InputProps<MultiChoiceQuestion>) {
  const value = record?.status === 'answered' ? (record.value as string[]) : [];
  const toggle = (v: string) => {
    const next = toggleMultiOption(q, value, v);
    const rec: AnswerRecord | undefined = next.length
      ? { questionId: q.id, value: next, status: 'answered', source: 'user' }
      : undefined;
    onChange(rec);
  };
  return (
    <div role="group" aria-labelledby={labelledBy} aria-describedby={describedBy} aria-invalid={invalid || undefined} className="choices">
      {q.options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <label key={opt.value} className={`choice ${selected ? 'choice--selected' : ''}`}>
            <input type="checkbox" name={q.id} value={opt.value} checked={selected} onChange={() => toggle(opt.value)} />
            <OptionBody opt={opt} kind="check" selected={selected} />
          </label>
        );
      })}
    </div>
  );
}
