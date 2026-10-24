import { t } from '../content/en';
import type { AnswerRecord, QuestionDefinition } from '../types';
import type { ConfirmedImportValue } from './flow';
import { formatCents } from './money';

/** Human-readable answer for review rows and previous-answer chips. */
export function formatAnswer(q: QuestionDefinition, rec: AnswerRecord | undefined): string {
  if (!rec) return t('common.notAnswered');
  if (rec.status === 'unknown') return t('common.unknown');
  if (rec.status === 'skipped') return t('common.skipped');
  if (rec.status === 'notApplicable') return '—';
  const v = rec.value;
  switch (q.type) {
    case 'singleChoice':
      return t(q.options.find((o) => o.value === v)?.labelKey ?? '');
    case 'multiChoice':
      return (v as string[]).map((x) => t(q.options.find((o) => o.value === x)?.labelKey ?? '')).join(', ');
    case 'currency':
      return formatCents(v as number);
    case 'number':
      return `${v} ${t(q.unitKey)}`;
    case 'date':
      return formatIsoDate(v as string);
    case 'shortText':
      return (v as string) || t('common.notAnswered');
    case 'relatedFields':
      return q.fields.map((f) => (v as Record<string, string>)[f.key]).filter(Boolean).join(' ');
    case 'documentUpload': {
      const n = (v as { documentIds: string[] }).documentIds.length;
      return n === 1 ? '1 file' : `${n} files`;
    }
    case 'confirmImported': {
      const c = v as ConfirmedImportValue;
      return q.format === 'currency' ? formatCents(c.value as number) : String(c.value);
    }
  }
}

export function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
