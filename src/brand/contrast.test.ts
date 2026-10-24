import { CONTRAST_PAIRS, contrastRatio } from './contrast';

describe('proposed token contrast (WCAG 2.2 AA)', () => {
  it.each(CONTRAST_PAIRS)('$fgName on $bgName ≥ $min:1', ({ fg, bg, min }) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});
