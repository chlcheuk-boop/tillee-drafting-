/**
 * Tillee mascot rig, built with the svg-mascot-creator skill
 * (.claude/skills/svg-mascot-creator): one fixed rig, swappable limbs.
 *
 * Every pose shares the same canvas, palette, anchors and layer order. A pose
 * may only change arm/leg paths, the expression and accent FX. Motion rotates
 * or translates the named groups around their anchors; no path is ever
 * animated. This module is the single source for the React component, the
 * exported SVG files and the motion frames (scripts/build-mascot.ts).
 *
 * Character: the bespectacled, bow-tied purple guide from tillee.io,
 * streamlined to a smooth silhouette with flat color (no gradients/filters).
 */

// ---- Palette (roles are fixed; hexes are literal so files stay portable) ----
export const PALETTE = {
  body: '#7A52E6',
  bodyShade: '#5A36C4', // right-side shade at 0.55 opacity, and legs
  outline: '#3F2596', // limb outline stroke
  hand: '#8C68EE',
  rim: '#2A2340', // glasses rims, pupils, brows, mouth
  lens: '#FFFFFF',
  accent: '#E0303A', // bow tie + every FX mark
  accentDark: '#A81E2A', // bow knot
  shadow: '#000000',
} as const;

// ---- Canvas and anchors (constants shared by every pose) ----
/** viewBox adds side margin so raised-hand FX never clip; rig coordinates are unchanged. */
export const CANVAS = { x: -12, w: 264, h: 240 };
export const ANCHORS = {
  shoulderL: [56, 128],
  shoulderR: [184, 128],
  hipL: [102, 180],
  hipR: [138, 180],
  neck: [120, 186], // head-tilt pivot: base of the body
  eyes: [120, 106],
  ground: [120, 218],
} as const;

type Pt = readonly [number, number];
type Arm = { path: Pt[]; hand: Pt };
type Leg = { path: Pt[] };

export type PoseName =
  | 'neutral'
  | 'waving'
  | 'pointing'
  | 'thinking'
  | 'reassuring'
  | 'celebrating'
  | 'supportive'
  | 'walking';

type Pose = {
  armFar: Arm; // viewer's left, drawn behind the body
  armNear: Arm; // viewer's right, drawn in front
  legs?: { back: Leg; front: Leg; shadowRx?: number };
  eyes: 'open' | 'up' | 'happy';
  brows?: 'raised' | 'concerned';
  mouth: 'smile' | 'open' | 'o' | 'flat' | 'soft' | 'laugh';
  fx?: 'waveArcs' | 'sparks' | 'thoughtDots' | 'pointLines';
};

const NEUTRAL_LEGS = {
  back: { path: [ANCHORS.hipL, [100, 206]] as Pt[] },
  front: { path: [ANCHORS.hipR, [140, 206]] as Pt[] },
};

const ARM_FAR_DOWN: Arm = { path: [ANCHORS.shoulderL, [40, 152], [42, 172]], hand: [43, 181] };
const ARM_NEAR_DOWN: Arm = { path: [ANCHORS.shoulderR, [200, 152], [198, 172]], hand: [197, 181] };

export const POSES: Record<PoseName, Pose> = {
  neutral: { armFar: ARM_FAR_DOWN, armNear: ARM_NEAR_DOWN, eyes: 'open', mouth: 'smile' },
  waving: {
    armFar: ARM_FAR_DOWN,
    armNear: { path: [ANCHORS.shoulderR, [206, 104], [212, 78]], hand: [214, 68] },
    eyes: 'open',
    mouth: 'open',
    fx: 'waveArcs',
  },
  pointing: {
    armFar: ARM_FAR_DOWN,
    armNear: { path: [ANCHORS.shoulderR, [208, 120], [222, 102]], hand: [227, 94] },
    eyes: 'open',
    brows: 'raised',
    mouth: 'o',
    fx: 'pointLines',
  },
  thinking: {
    armFar: ARM_FAR_DOWN,
    // Hand rests on the cheek, clear of the bow tie.
    armNear: { path: [ANCHORS.shoulderR, [198, 156], [170, 146]], hand: [161, 143] },
    eyes: 'up',
    mouth: 'flat',
    fx: 'thoughtDots',
  },
  reassuring: {
    armFar: { path: [ANCHORS.shoulderL, [36, 146], [30, 164]], hand: [28, 173] },
    armNear: { path: [ANCHORS.shoulderR, [204, 146], [210, 164]], hand: [212, 173] },
    eyes: 'happy',
    mouth: 'soft',
  },
  celebrating: {
    armFar: { path: [ANCHORS.shoulderL, [38, 100], [34, 74]], hand: [33, 64] },
    armNear: { path: [ANCHORS.shoulderR, [202, 100], [206, 74]], hand: [207, 64] },
    eyes: 'open',
    mouth: 'laugh',
    fx: 'sparks',
  },
  supportive: {
    armFar: ARM_FAR_DOWN,
    armNear: { path: [ANCHORS.shoulderR, [208, 146], [220, 166]], hand: [224, 175] },
    eyes: 'open',
    brows: 'concerned',
    mouth: 'soft',
  },
  walking: {
    armFar: { path: [ANCHORS.shoulderL, [38, 146], [34, 168]], hand: [33, 177] },
    armNear: { path: [ANCHORS.shoulderR, [204, 150], [210, 170]], hand: [212, 179] },
    legs: {
      back: { path: [ANCHORS.hipL, [92, 204]] },
      front: { path: [ANCHORS.hipR, [150, 203]] },
      shadowRx: 64,
    },
    eyes: 'open',
    mouth: 'smile',
  },
};

/** Map from the app's semantic poses to rig poses. */
export const APP_POSE_TO_RIG = {
  neutral: 'neutral',
  greeting: 'waving',
  thinking: 'thinking',
  explaining: 'pointing',
  reassuring: 'reassuring',
  celebrating: 'celebrating',
  supportive: 'supportive',
} as const satisfies Record<string, PoseName>;

// ---- Motion specs (data shared by CSS and the frame exporter) ----
export type Key = { at: number; rotate?: number; ty?: number; sx?: number; sy?: number; opacity?: number };
export type Track = { group: GroupName; pivot: Pt; keys: Key[] };
export type Motion = {
  name: string;
  pose: PoseName;
  durationMs: number;
  loop: boolean;
  /** Where the app uses it. */
  use: string;
  tracks: Track[];
};

export type GroupName = 'mascot' | 'shadow' | 'arm-far' | 'arm-near' | 'leg-back' | 'leg-front' | 'head' | 'eyes' | 'fx';

const P = ANCHORS;
const blink: Track = {
  group: 'eyes',
  pivot: P.eyes,
  keys: [{ at: 0, sy: 1 }, { at: 0.92, sy: 1 }, { at: 0.95, sy: 0.1 }, { at: 1, sy: 1 }],
};

export const MOTIONS: Motion[] = [
  {
    name: 'idle',
    pose: 'neutral',
    durationMs: 3200,
    loop: true,
    use: 'Desktop progress column; any resting placement',
    tracks: [
      { group: 'mascot', pivot: P.ground, keys: [{ at: 0, ty: 0 }, { at: 0.5, ty: -4 }, { at: 1, ty: 0 }] },
      { group: 'shadow', pivot: P.ground, keys: [{ at: 0, sx: 1, opacity: 0.25 }, { at: 0.5, sx: 0.9, opacity: 0.16 }, { at: 1, sx: 1, opacity: 0.25 }] },
      { group: 'arm-near', pivot: P.shoulderR, keys: [{ at: 0, rotate: 0 }, { at: 0.5, rotate: 3 }, { at: 1, rotate: 0 }] },
      { group: 'arm-far', pivot: P.shoulderL, keys: [{ at: 0, rotate: 0 }, { at: 0.5, rotate: -3 }, { at: 1, rotate: 0 }] },
    ],
  },
  {
    name: 'blink',
    pose: 'neutral',
    durationMs: 5000,
    loop: true,
    use: 'Layered on idle',
    tracks: [blink],
  },
  {
    name: 'wave',
    pose: 'waving',
    durationMs: 900,
    loop: true,
    use: 'Welcome screen (plays twice, then rests)',
    tracks: [
      { group: 'arm-near', pivot: P.shoulderR, keys: [{ at: 0, rotate: -8 }, { at: 0.5, rotate: 8 }, { at: 1, rotate: -8 }] },
      { group: 'fx', pivot: [230, 66], keys: [{ at: 0, opacity: 0.4 }, { at: 0.5, opacity: 1 }, { at: 1, opacity: 0.4 }] },
    ],
  },
  {
    name: 'think',
    pose: 'thinking',
    durationMs: 2400,
    loop: true,
    use: 'Processing screen while real work runs',
    tracks: [
      { group: 'mascot', pivot: P.ground, keys: [{ at: 0, ty: 0 }, { at: 0.5, ty: -3 }, { at: 1, ty: 0 }] },
      { group: 'head', pivot: P.neck, keys: [{ at: 0, rotate: 0 }, { at: 0.5, rotate: 2.5 }, { at: 1, rotate: 0 }] },
      { group: 'fx', pivot: [212, 54], keys: [{ at: 0, opacity: 0.3 }, { at: 0.5, opacity: 1 }, { at: 1, opacity: 0.3 }] },
    ],
  },
  {
    name: 'explain',
    pose: 'pointing',
    durationMs: 1600,
    loop: false,
    use: '“Why we ask” (one emphasis beat)',
    tracks: [
      { group: 'arm-near', pivot: P.shoulderR, keys: [{ at: 0, rotate: 0 }, { at: 0.3, rotate: -6 }, { at: 0.6, rotate: 0 }, { at: 1, rotate: 0 }] },
      { group: 'fx', pivot: [236, 86], keys: [{ at: 0, opacity: 0 }, { at: 0.3, opacity: 1 }, { at: 1, opacity: 1 }] },
    ],
  },
  {
    name: 'reassure',
    pose: 'reassuring',
    durationMs: 1400,
    loop: false,
    use: 'Saved / result screen (one nod)',
    tracks: [
      { group: 'head', pivot: P.neck, keys: [{ at: 0, rotate: 0 }, { at: 0.3, rotate: -3 }, { at: 0.6, rotate: 2 }, { at: 1, rotate: 0 }] },
    ],
  },
  {
    name: 'celebrate',
    pose: 'celebrating',
    durationMs: 800,
    loop: false,
    use: 'Section break (one hop)',
    tracks: [
      {
        group: 'mascot',
        pivot: P.ground,
        keys: [
          { at: 0, ty: 0, sy: 1 },
          { at: 0.2, ty: 0, sy: 0.94 },
          { at: 0.5, ty: -12, sy: 1.03 },
          { at: 0.8, ty: 0, sy: 0.97 },
          { at: 1, ty: 0, sy: 1 },
        ],
      },
      { group: 'shadow', pivot: P.ground, keys: [{ at: 0, sx: 1 }, { at: 0.5, sx: 0.75 }, { at: 1, sx: 1 }] },
      { group: 'fx', pivot: [120, 30], keys: [{ at: 0, opacity: 0, sx: 0.8, sy: 0.8 }, { at: 0.5, opacity: 1, sx: 1.1, sy: 1.1 }, { at: 1, opacity: 1, sx: 1, sy: 1 }] },
    ],
  },
  {
    name: 'support',
    pose: 'supportive',
    durationMs: 2000,
    loop: false,
    use: 'Upload or save failure',
    tracks: [
      { group: 'arm-near', pivot: P.shoulderR, keys: [{ at: 0, rotate: 0 }, { at: 0.4, rotate: -4 }, { at: 1, rotate: 0 }] },
      { group: 'head', pivot: P.neck, keys: [{ at: 0, rotate: 0 }, { at: 0.4, rotate: 2 }, { at: 1, rotate: 0 }] },
    ],
  },
  {
    name: 'walk',
    pose: 'walking',
    durationMs: 700,
    loop: true,
    use: 'Motion-design source (entrances, empty states)',
    tracks: [
      { group: 'leg-front', pivot: P.hipR, keys: [{ at: 0, rotate: -14 }, { at: 0.5, rotate: 14 }, { at: 1, rotate: -14 }] },
      { group: 'leg-back', pivot: P.hipL, keys: [{ at: 0, rotate: 14 }, { at: 0.5, rotate: -14 }, { at: 1, rotate: 14 }] },
      { group: 'arm-near', pivot: P.shoulderR, keys: [{ at: 0, rotate: 10 }, { at: 0.5, rotate: -10 }, { at: 1, rotate: 10 }] },
      { group: 'arm-far', pivot: P.shoulderL, keys: [{ at: 0, rotate: -10 }, { at: 0.5, rotate: 10 }, { at: 1, rotate: -10 }] },
      { group: 'mascot', pivot: P.ground, keys: [{ at: 0, ty: 0 }, { at: 0.25, ty: -3 }, { at: 0.5, ty: 0 }, { at: 0.75, ty: -3 }, { at: 1, ty: 0 }] },
    ],
  },
];

// ---- SVG construction ----
const C = PALETTE;
const pts = (p: Pt[]) => p.map(([x, y]) => `${x},${y}`).join(' L');

function limb(path: Pt[], outlineW: number, fillW: number, fill: string) {
  const d = `M${pts(path)}`;
  return (
    `<path d="${d}" fill="none" stroke="${C.outline}" stroke-width="${outlineW}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${fillW}" stroke-linecap="round" stroke-linejoin="round"/>`
  );
}
function arm(a: Arm) {
  return limb(a.path, 17, 12, C.body) + `<circle cx="${a.hand[0]}" cy="${a.hand[1]}" r="9" fill="${C.hand}" stroke="${C.outline}" stroke-width="2.5"/>`;
}

function eyes(kind: Pose['eyes']) {
  if (kind === 'happy') {
    return ['M88,108 Q96,98 104,108', 'M136,108 Q144,98 152,108']
      .map((d) => `<path d="${d}" fill="none" stroke="${C.rim}" stroke-width="4.5" stroke-linecap="round"/>`)
      .join('');
  }
  const dy = kind === 'up' ? -5 : 0;
  const dx = kind === 'up' ? 3 : 0;
  return [96, 144]
    .map(
      (x) =>
        `<circle cx="${x + 2 + dx}" cy="${106 + dy}" r="7.5" fill="${C.rim}"/><circle cx="${x + 4.5 + dx}" cy="${103 + dy}" r="2.4" fill="${C.lens}"/>`,
    )
    .join('');
}

function brows(kind: Pose['brows']) {
  const s = `fill="none" stroke="${C.rim}" stroke-width="4.5" stroke-linecap="round"`;
  if (kind === 'raised') return `<path d="M132,74 Q144,66 156,74" ${s}/>`;
  if (kind === 'concerned') return `<path d="M80,82 L104,74" ${s}/><path d="M136,74 L160,82" ${s}/>`;
  return '';
}

function mouth(kind: Pose['mouth']) {
  const s = `fill="none" stroke="${C.rim}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"`;
  switch (kind) {
    case 'smile':
      return `<path d="M110,136 Q120,144 130,136" ${s}/>`;
    case 'soft':
      return `<path d="M112,138 Q120,142 128,138" ${s}/>`;
    case 'flat':
      return `<path d="M113,139 L127,139" ${s}/>`;
    case 'o':
      return `<ellipse cx="120" cy="139" rx="5.5" ry="5" fill="${C.rim}"/>`;
    case 'open':
      return `<path d="M108,134 Q120,152 132,134 Z" fill="${C.rim}" stroke="${C.rim}" stroke-width="3" stroke-linejoin="round"/>`;
    case 'laugh':
      return (
        `<path d="M104,132 Q120,158 136,132 Z" fill="${C.rim}" stroke="${C.rim}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M110,135 L130,135 L128,139 L112,139 Z" fill="${C.lens}"/>`
      );
  }
}

function fx(kind: Pose['fx']) {
  const a = `stroke="${C.accent}" stroke-linecap="round" fill="none"`;
  switch (kind) {
    case 'waveArcs':
      return `<path d="M228,54 Q237,66 230,80" ${a} stroke-width="3.5" opacity="0.9"/><path d="M236,46 Q248,66 238,88" ${a} stroke-width="3.5" opacity="0.55"/>`;
    case 'pointLines':
      return `<path d="M232,80 L238,74" ${a} stroke-width="3.5" opacity="0.9"/><path d="M236,92 L239,92" ${a} stroke-width="3.5" opacity="0.6"/>`;
    case 'sparks':
      return (
        `<path d="M120,22 L120,34" ${a} stroke-width="4"/><path d="M96,28 L102,38" ${a} stroke-width="4"/><path d="M144,28 L138,38" ${a} stroke-width="4"/>` +
        `<circle cx="20" cy="44" r="3" fill="${C.accent}"/><circle cx="220" cy="44" r="3" fill="${C.accent}"/>`
      );
    case 'thoughtDots':
      return `<circle cx="204" cy="64" r="5" fill="${C.accent}" opacity="0.85"/><circle cx="218" cy="46" r="3.5" fill="${C.accent}" opacity="0.6"/>`;
    default:
      return '';
  }
}

export type BuildOptions = {
  /** 'id' for standalone files (skill convention); 'class' for inline use where ids would collide. */
  hooks?: 'id' | 'class';
  /** Group transforms to bake in (used to export motion frames). */
  transforms?: Partial<Record<GroupName, { transform?: string; opacity?: number }>>;
  /** Extra markup (a <style> block) placed first inside the svg. */
  style?: string;
  size?: number;
  title?: string;
};

/** Build the full SVG markup for a pose. Layer order never changes. */
export function buildMascotSvg(poseName: PoseName, opts: BuildOptions = {}): string {
  const pose = POSES[poseName];
  const hooks = opts.hooks ?? 'id';
  const g = (name: GroupName, inner: string) => {
    const t = opts.transforms?.[name];
    const attr = hooks === 'id' ? `id="${name}"` : `class="m-${name}"`;
    const tr = t?.transform ? ` transform="${t.transform}"` : '';
    const op = t?.opacity !== undefined ? ` opacity="${t.opacity}"` : '';
    return `<g ${attr}${tr}${op}>${inner}</g>`;
  };
  const legs = pose.legs ?? NEUTRAL_LEGS;
  const shadowRx = pose.legs?.shadowRx ?? 56;
  const size = opts.size ? ` width="${opts.size}" height="${opts.size}"` : '';

  const body =
    // 1. legs (behind body)
    g('leg-back', limb(legs.back.path, 22, 16, C.bodyShade)) +
    g('leg-front', limb(legs.front.path, 22, 16, C.bodyShade)) +
    // 2. far arm
    g('arm-far', arm(pose.armFar)) +
    // 3. body + right-side shade
    `<circle cx="120" cy="120" r="72" fill="${C.body}"/>` +
    `<path d="M120,48 A72,72 0 0 1 120,192 A44,72 0 0 0 120,48 Z" fill="${C.bodyShade}" opacity="0.55"/>` +
    // 4. face
    g(
      'head',
      // glasses
      `<circle cx="96" cy="106" r="21" fill="${C.lens}" stroke="${C.rim}" stroke-width="5"/>` +
        `<circle cx="144" cy="106" r="21" fill="${C.lens}" stroke="${C.rim}" stroke-width="5"/>` +
        `<path d="M117,103 Q120,98 123,103" fill="none" stroke="${C.rim}" stroke-width="5" stroke-linecap="round"/>` +
        g('eyes', eyes(pose.eyes)) +
        brows(pose.brows) +
        mouth(pose.mouth) +
        // bow tie
        `<path d="M120,168 L97,156 Q91,168 97,180 Z" fill="${C.accent}"/>` +
        `<path d="M120,168 L143,156 Q149,168 143,180 Z" fill="${C.accent}"/>` +
        `<rect x="113" y="161" width="14" height="14" rx="4" fill="${C.accentDark}"/>`,
    ) +
    // 5. near arm (front)
    g('arm-near', arm(pose.armNear)) +
    // 6. accent FX
    g('fx', fx(pose.fx));

  const shadowT = opts.transforms?.shadow;
  const shadowAttr = hooks === 'id' ? 'id="shadow"' : 'class="m-shadow"';
  const shadow = `<ellipse ${shadowAttr} cx="${P.ground[0]}" cy="${P.ground[1]}" rx="${shadowRx}" ry="7" fill="${C.shadow}" opacity="${shadowT?.opacity ?? 0.25}"${shadowT?.transform ? ` transform="${shadowT.transform}"` : ''}/>`;

  const title = opts.title ? `<title>${opts.title}</title>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CANVAS.x} 0 ${CANVAS.w} ${CANVAS.h}"${size}>${title}${opts.style ?? ''}${shadow}${g('mascot', body)}</svg>`;
}

// ---- Motion helpers ----
const sel = (group: GroupName, hooks: 'id' | 'class', scope = '') =>
  hooks === 'id' ? `${scope}#${group}` : `${scope}.m-${group}`;

function keyTransform(k: Key) {
  const parts: string[] = [];
  if (k.ty !== undefined) parts.push(`translateY(${k.ty}px)`);
  if (k.rotate !== undefined) parts.push(`rotate(${k.rotate}deg)`);
  if (k.sx !== undefined || k.sy !== undefined) parts.push(`scale(${k.sx ?? 1}, ${k.sy ?? 1})`);
  return parts.join(' ');
}

/**
 * CSS for a motion. With hooks 'class' and a scope (e.g. `.mascot--wave `),
 * it can be injected once into the app; with 'id' it goes inside a file.
 */
export function motionCss(m: Motion, hooks: 'id' | 'class', scope = '', iterations?: number | 'infinite'): string {
  const count = iterations ?? (m.loop ? 'infinite' : 1);
  return m.tracks
    .map((tr) => {
      const kf = `m-${m.name}-${tr.group}`;
      const frames = tr.keys
        .map((k) => {
          const t = keyTransform(k);
          const props = [t ? `transform: ${t}` : '', k.opacity !== undefined ? `opacity: ${k.opacity}` : ''].filter(Boolean).join('; ');
          return `${(k.at * 100).toFixed(1)}% { ${props} }`;
        })
        .join(' ');
      return (
        `${sel(tr.group, hooks, scope)} { transform-box: view-box; transform-origin: ${tr.pivot[0]}px ${tr.pivot[1]}px; animation: ${kf} ${m.durationMs}ms ease-in-out ${count} both; }\n` +
        `@keyframes ${kf} { ${frames} }`
      );
    })
    .join('\n');
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2); // ease-in-out quad

/** Sample a track at time t (0..1) using the same ease-in-out between keys. */
export function sampleTrack(tr: Track, t: number): Key {
  const keys = tr.keys;
  let i = keys.findIndex((k) => k.at >= t);
  if (i <= 0) return keys[Math.max(i, 0)];
  const a = keys[i - 1];
  const b = keys[i];
  const local = ease((t - a.at) / (b.at - a.at || 1));
  const mix = (f: keyof Key, dflt: number) =>
    a[f] === undefined && b[f] === undefined ? undefined : lerp((a[f] as number) ?? dflt, (b[f] as number) ?? dflt, local);
  return {
    at: t,
    rotate: mix('rotate', 0),
    ty: mix('ty', 0),
    sx: mix('sx', 1),
    sy: mix('sy', 1),
    opacity: mix('opacity', 1),
  };
}

/** SVG transform attribute equivalent of a sampled key around a pivot. */
export function keyToSvgTransform(k: Key, pivot: Pt): string | undefined {
  const [px, py] = pivot;
  const parts: string[] = [];
  if (k.ty) parts.push(`translate(0 ${k.ty.toFixed(2)})`);
  if (k.rotate) parts.push(`rotate(${k.rotate.toFixed(2)} ${px} ${py})`);
  if ((k.sx !== undefined && k.sx !== 1) || (k.sy !== undefined && k.sy !== 1)) {
    parts.push(`translate(${px} ${py}) scale(${(k.sx ?? 1).toFixed(3)} ${(k.sy ?? 1).toFixed(3)}) translate(${-px} ${-py})`);
  }
  return parts.length ? parts.join(' ') : undefined;
}

export const REDUCED_MOTION_CSS = (hooks: 'id' | 'class', scope = '') =>
  `@media (prefers-reduced-motion: reduce) { ${(['mascot', 'shadow', 'arm-far', 'arm-near', 'leg-back', 'leg-front', 'head', 'eyes', 'fx'] as GroupName[])
    .map((g) => sel(g, hooks, scope))
    .join(', ')} { animation: none !important; } }`;
