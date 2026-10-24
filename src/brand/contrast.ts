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
  { fgName: 'ink', fg: '#1b2430', bgName: 'canvas', bg: '#f6f4ef', min: 4.5 },
  { fgName: 'ink-muted', fg: '#4a5565', bgName: 'canvas', bg: '#f6f4ef', min: 4.5 },
  { fgName: 'ink-muted', fg: '#4a5565', bgName: 'surface', bg: '#ffffff', min: 4.5 },
  { fgName: 'on-primary', fg: '#ffffff', bgName: 'primary', bg: '#0b6e5b', min: 4.5 },
  { fgName: 'primary', fg: '#0b6e5b', bgName: 'canvas', bg: '#f6f4ef', min: 4.5 },
  { fgName: 'primary', fg: '#0b6e5b', bgName: 'primary-tint', bg: '#e3f2ee', min: 4.5 },
  { fgName: 'ink', fg: '#1b2430', bgName: 'primary-tint', bg: '#e3f2ee', min: 4.5 },
  { fgName: 'danger', fg: '#b42318', bgName: 'canvas', bg: '#f6f4ef', min: 4.5 },
  { fgName: 'ink', fg: '#1b2430', bgName: 'warning-tint', bg: '#fff4dc', min: 4.5 },
  { fgName: 'border (input edge)', fg: '#8a8f98', bgName: 'surface', bg: '#ffffff', min: 3 },
  { fgName: 'focus ring', fg: '#1d4ed8', bgName: 'canvas', bg: '#f6f4ef', min: 3 },
  { fgName: 'selected border', fg: '#0b6e5b', bgName: 'surface', bg: '#ffffff', min: 3 },
];
