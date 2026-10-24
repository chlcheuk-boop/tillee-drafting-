/**
 * Currency input helpers. Amounts are stored as integer cents so decimal
 * precision is never lost to floating point.
 */

/** Returns cents, `null` for blank input, or `'invalid'` for unparseable text. */
export function parseCurrencyInput(raw: string, { allowNegative = false } = {}): number | null | 'invalid' {
  const s = raw.trim().replace(/[$,\s]/g, '');
  if (s === '') return null;
  const m = /^(-)?(\d+)(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) return 'invalid';
  if (m[1] && !allowNegative) return 'invalid';
  const cents = Number(m[2]) * 100 + Number((m[3] ?? '').padEnd(2, '0'));
  if (!Number.isSafeInteger(cents)) return 'invalid';
  return m[1] ? -cents : cents;
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

/** Editable text for an existing amount, without currency symbol or grouping. */
export function centsToInput(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = abs % 100;
  return `${sign}${whole}${frac ? '.' + String(frac).padStart(2, '0') : ''}`;
}
