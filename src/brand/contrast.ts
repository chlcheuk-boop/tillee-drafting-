/** WCAG 2.x relative-luminance contrast ratio for #rrggbb colours. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, bl] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Proposed token pairs that carry text or essential UI, with their minimums. */
export const CONTRAST_PAIRS: Array<{ fg: string; bg: string; fgName: string; bgName: string; min: number }> = [
  { fgName: 'ink', fg: '#2a2340', bgName: 'canvas', bg: '#fff9f2', min: 4.5 },
  { fgName: 'ink-muted', fg: '#5d566e', bgName: 'canvas', bg: '#fff9f2', min: 4.5 },
  { fgName: 'ink-muted', fg: '#5d566e', bgName: 'surface', bg: '#ffffff', min: 4.5 },
  { fgName: 'ink-muted', fg: '#5d566e', bgName: 'hero lavender', bg: '#f4ecfd', min: 4.5 },
  { fgName: 'on-primary', fg: '#ffffff', bgName: 'primary', bg: '#6941d9', min: 4.5 },
  { fgName: 'primary', fg: '#6941d9', bgName: 'canvas', bg: '#fff9f2', min: 4.5 },
  { fgName: 'primary', fg: '#6941d9', bgName: 'primary-tint', bg: '#f3edff', min: 4.5 },
  { fgName: 'ink', fg: '#2a2340', bgName: 'primary-tint', bg: '#f3edff', min: 4.5 },
  { fgName: 'danger', fg: '#a3203a', bgName: 'canvas', bg: '#fff9f2', min: 4.5 },
  { fgName: 'success', fg: '#1d7348', bgName: 'success-tint', bg: '#e3f6ec', min: 4.5 },
  { fgName: 'amber', fg: '#7a4b00', bgName: 'amber-tint', bg: '#fdf0d2', min: 4.5 },
  { fgName: 'border (input edge)', fg: '#8f8a9c', bgName: 'surface', bg: '#ffffff', min: 3 },
  { fgName: 'focus ring', fg: '#2a2340', bgName: 'canvas', bg: '#fff9f2', min: 3 },
  { fgName: 'selected border', fg: '#6941d9', bgName: 'surface', bg: '#ffffff', min: 3 },
  // Dark appearance
  { fgName: 'dark ink', fg: '#f3eff8', bgName: 'dark canvas', bg: '#17131f', min: 4.5 },
  { fgName: 'dark ink-muted', fg: '#b9b2c7', bgName: 'dark surface', bg: '#221c2e', min: 4.5 },
  { fgName: 'dark on-primary', fg: '#17131f', bgName: 'dark primary', bg: '#a68bf7', min: 4.5 },
  { fgName: 'dark primary', fg: '#a68bf7', bgName: 'dark primary-tint', bg: '#2e2545', min: 4.5 },
  { fgName: 'dark danger', fg: '#ff8fa0', bgName: 'dark canvas', bg: '#17131f', min: 4.5 },
  { fgName: 'dark success', fg: '#7fdcae', bgName: 'dark success-tint', bg: '#163527', min: 4.5 },
  { fgName: 'dark amber', fg: '#f3c46b', bgName: 'dark amber-tint', bg: '#3a2e14', min: 4.5 },
  { fgName: 'dark border', fg: '#7d7690', bgName: 'dark surface', bg: '#221c2e', min: 3 },
];
