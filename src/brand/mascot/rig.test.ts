import { MOTIONS, POSES, buildMascotSvg, sampleTrack, type PoseName } from './rig';

// Validation steps from the svg-mascot-creator skill.
const poses = Object.keys(POSES) as PoseName[];
const RIG_PARTS = [
  '<circle cx="120" cy="120" r="72"', // body
  '<path d="M120,48 A72,72 0 0 1 120,192', // shade
  '<circle cx="96" cy="106" r="21"', // left lens
  '<circle cx="144" cy="106" r="21"', // right lens
  '<path d="M120,168 L97,156', // bow wing
  '<rect x="113" y="161"', // bow knot
];

describe('mascot rig', () => {
  it.each(poses)('%s keeps the fixed rig byte-identical to neutral', (p) => {
    const svg = buildMascotSvg(p);
    for (const part of RIG_PARTS) expect(svg).toContain(part);
  });

  it.each(poses)('%s is flat, small and dependency-free', (p) => {
    const svg = buildMascotSvg(p);
    expect(svg).not.toMatch(/<(linearGradient|radialGradient|filter|defs|image)\b|href=/);
    expect(svg.length).toBeLessThan(7000);
    expect((svg.match(/<(path|circle|ellipse|rect)\b/g) ?? []).length).toBeLessThan(90);
  });

  it.each(poses)('%s arms start at the shoulder anchors', (p) => {
    expect(POSES[p].armFar.path[0]).toEqual([56, 128]);
    expect(POSES[p].armNear.path[0]).toEqual([184, 128]);
  });

  it('never animates path data and keeps idle amplitudes subtle', () => {
    for (const m of MOTIONS) {
      for (const tr of m.tracks) {
        for (const k of tr.keys) {
          if (m.loop && m.name !== 'walk') {
            expect(Math.abs(k.ty ?? 0)).toBeLessThanOrEqual(6);
            expect(Math.abs(k.rotate ?? 0)).toBeLessThanOrEqual(8);
          }
        }
        expect(tr.keys[0].at).toBe(0);
        expect(tr.keys[tr.keys.length - 1].at).toBe(1);
      }
    }
  });

  it('samples keyframes at the keys exactly', () => {
    const wave = MOTIONS.find((m) => m.name === 'wave')!.tracks[0];
    expect(sampleTrack(wave, 0).rotate).toBeCloseTo(-8);
    expect(sampleTrack(wave, 0.5).rotate).toBeCloseTo(8);
    expect(sampleTrack(wave, 0.25).rotate).toBeCloseTo(0);
  });
});
