/**
 * Tillee mascot: vector redraw of the character on the tillee.io homepage
 * (round fuzzy purple body, big round glasses, red bow tie, little arms and
 * feet). Drawn from a low-resolution screenshot, so proportions are
 * approximate. Swap in the original asset paths when available and keep the
 * `pose` API. See docs/brand/MASCOT.md.
 */
export type MascotPose =
  | 'neutral'
  | 'greeting'
  | 'thinking'
  | 'explaining'
  | 'reassuring'
  | 'celebrating'
  | 'supportive';

export const MASCOT_POSES: MascotPose[] = [
  'neutral',
  'greeting',
  'thinking',
  'explaining',
  'reassuring',
  'celebrating',
  'supportive',
];

/** Minimum rendered size; below this the glasses stop reading. */
export const MASCOT_MIN_SIZE = 32;

type Props = {
  pose?: MascotPose;
  size?: number;
  /** Provide a label only when the mascot conveys meaning not present in text. */
  label?: string;
  animate?: boolean;
  className?: string;
};

const C = {
  body: 'var(--mascot-body)',
  shade: 'var(--mascot-shade)',
  light: 'var(--mascot-light)',
  rim: 'var(--mascot-rim)',
  lens: 'var(--mascot-lens)',
  bow: 'var(--mascot-bow)',
  bowShade: 'var(--mascot-bow-shade)',
  spark: 'var(--mascot-spark)',
};

/** Soft "fuzzy" outline: a circle with small regular bumps. */
function fuzzyCircle(cx: number, cy: number, r: number, bumps = 22, depth = 1.8): string {
  const pts: string[] = [];
  const steps = bumps * 6;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = r + Math.sin(a * bumps) * depth;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
}
const BODY = fuzzyCircle(70, 70, 44);

export function Mascot({ pose = 'neutral', size = 96, label, animate = true, className }: Props) {
  const s = Math.max(size, MASCOT_MIN_SIZE);
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <svg
      viewBox="0 0 140 140"
      width={s}
      height={s}
      className={['mascot', animate ? `mascot--${pose}` : '', className].filter(Boolean).join(' ')}
      focusable="false"
      {...a11y}
    >
      <g className="mascot__body">
        {/* Feet */}
        <ellipse cx="54" cy="116" rx="10" ry="6" fill={C.shade} />
        <ellipse cx="86" cy="116" rx="10" ry="6" fill={C.shade} />
        <Arms pose={pose} />
        <path d={BODY} fill={C.body} />
        <ellipse cx="54" cy="44" rx="16" ry="10" fill={C.light} opacity="0.55" transform="rotate(-25 54 44)" />
        <Face pose={pose} />
        <BowTie />
        {pose === 'celebrating' && <Sparkles />}
      </g>
    </svg>
  );
}

function BowTie() {
  return (
    <g>
      <path d="M70 92 L52 83 Q48 92 52 101 Z" fill={C.bow} />
      <path d="M70 92 L88 83 Q92 92 88 101 Z" fill={C.bow} />
      <rect x="64" y="87" width="12" height="10" rx="3" fill={C.bowShade} />
    </g>
  );
}

function Face({ pose }: { pose: MascotPose }) {
  // Pupil offset per pose (where the character is looking).
  const look: Record<MascotPose, [number, number]> = {
    neutral: [0, 1],
    greeting: [0, 0],
    thinking: [3, -4],
    explaining: [3, 0],
    reassuring: [0, 0],
    celebrating: [0, 0],
    supportive: [0, 2],
  };
  const [dx, dy] = look[pose];
  const closed = pose === 'reassuring' || pose === 'celebrating';
  const stroke = { stroke: C.rim, strokeWidth: 3.5, fill: 'none', strokeLinecap: 'round' as const };

  const lens = (cx: number) => (
    <g>
      <circle cx={cx} cy={60} r={14} fill={C.lens} stroke={C.rim} strokeWidth="4" />
      {closed ? (
        <path d={`M${cx - 6} 62 q6 -7 12 0`} {...stroke} />
      ) : (
        <>
          <circle cx={cx + dx} cy={60 + dy} r={5.5} fill={C.rim} />
          <circle cx={cx + dx + 2} cy={58 + dy} r={1.8} fill={C.lens} />
        </>
      )}
    </g>
  );

  const brows: Partial<Record<MascotPose, JSX.Element>> = {
    thinking: (
      <g>
        <path d="M44 40 l12 -2" {...stroke} />
        <path d="M84 37 l12 3" {...stroke} />
      </g>
    ),
    explaining: <path d="M84 38 q8 -5 14 0" {...stroke} />,
    supportive: (
      <g>
        <path d="M43 42 l13 -5" {...stroke} />
        <path d="M84 37 l13 5" {...stroke} />
      </g>
    ),
  };

  const mouths: Record<MascotPose, JSX.Element> = {
    neutral: <path d="M64 79 q6 5 12 0" {...stroke} />,
    greeting: <path d="M62 77 q8 9 16 0 z" fill={C.rim} stroke={C.rim} strokeWidth="2" strokeLinejoin="round" />,
    thinking: <path d="M66 80 h9" {...stroke} />,
    explaining: <ellipse cx="70" cy="80" rx="4" ry="3.5" fill={C.rim} />,
    reassuring: <path d="M63 78 q7 6 14 0" {...stroke} />,
    celebrating: <path d="M61 76 q9 11 18 0 z" fill={C.rim} stroke={C.rim} strokeWidth="2" strokeLinejoin="round" />,
    supportive: <path d="M64 81 q6 -3 12 0" {...stroke} />,
  };

  return (
    <g>
      {lens(52)}
      {lens(88)}
      {/* Bridge */}
      <path d="M66 60 q4 -3 8 0" stroke={C.rim} strokeWidth="4" fill="none" strokeLinecap="round" />
      {brows[pose]}
      {mouths[pose]}
    </g>
  );
}

function Arms({ pose }: { pose: MascotPose }) {
  const arm = { stroke: C.body, strokeWidth: 11, fill: 'none', strokeLinecap: 'round' as const };
  const down = (side: 'l' | 'r') =>
    side === 'l' ? <path d="M32 82 q-8 8 -6 18" {...arm} /> : <path d="M108 82 q8 8 6 18" {...arm} />;
  switch (pose) {
    case 'greeting':
      return (
        <g>
          {down('r')}
          <g className="mascot__wave">
            <path d="M32 74 q-14 -6 -14 -26" {...arm} />
          </g>
        </g>
      );
    case 'thinking':
      return (
        <g>
          {down('l')}
          <path d="M106 86 q4 -10 -10 -10" {...arm} />
          <circle className="mascot__dot" cx="118" cy="30" r="3.5" fill={C.shade} />
          <circle className="mascot__dot" cx="128" cy="18" r="2.5" fill={C.shade} />
        </g>
      );
    case 'explaining':
      return (
        <g>
          {down('l')}
          <path d="M108 78 q12 -2 22 -12" {...arm} />
        </g>
      );
    case 'celebrating':
      return (
        <g>
          <path d="M32 72 q-14 -8 -12 -30" {...arm} />
          <path d="M108 72 q14 -8 12 -30" {...arm} />
        </g>
      );
    case 'supportive':
      return (
        <g>
          {down('l')}
          <path d="M108 84 q14 2 20 14" {...arm} />
        </g>
      );
    default:
      return (
        <g>
          {down('l')}
          {down('r')}
        </g>
      );
  }
}

function Sparkles() {
  const star = (x: number, y: number, r: number) => (
    <path
      d={`M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`}
      fill={C.spark}
    />
  );
  return (
    <g className="mascot__sparkles">
      {star(16, 18, 7)}
      {star(124, 14, 5)}
    </g>
  );
}

/** Text wordmark approximating the tillee.io logo. Replace with the logo SVG. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={['wordmark', className].filter(Boolean).join(' ')} aria-label="Tillee">
      <span aria-hidden="true">
        Tillee<span className="wordmark__dot">.</span>
      </span>
    </span>
  );
}
