/**
 * PROPOSED PLACEHOLDER MASCOT. Not an approved Tillee asset.
 *
 * No existing Tillee mascot or logo files were available to this work, so this
 * is a code-native stand-in that defines the pose set, drawing grammar and
 * integration points. Replace the artwork with the approved character while
 * keeping the `pose` API. See docs/brand/MASCOT.md.
 *
 * Concept: a small, self-possessed receipt ("tally") with a ledger for a belly.
 * Paperwork that's on your side.
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

/** Minimum rendered size; below this the face stops reading. */
export const MASCOT_MIN_SIZE = 40;

type Props = {
  pose?: MascotPose;
  size?: number;
  /** Provide a label only when the mascot conveys meaning not present in text. */
  label?: string;
  animate?: boolean;
  className?: string;
};

const INK = 'var(--mascot-ink)';
const PAPER = 'var(--mascot-paper)';
const CHEEK = 'var(--mascot-cheek)';
const LINE = 'var(--mascot-ledger)';

export function Mascot({ pose = 'neutral', size = 96, label, animate = true, className }: Props) {
  const s = Math.max(size, MASCOT_MIN_SIZE);
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <svg
      viewBox="0 0 140 150"
      width={s}
      height={(s * 150) / 140}
      className={['mascot', animate ? `mascot--${pose}` : '', className].filter(Boolean).join(' ')}
      focusable="false"
      {...a11y}
    >
      <g className="mascot__body">
        <Arms pose={pose} />
        {/* Receipt body: rounded top, torn zigzag bottom */}
        <path
          d="M38 22 h64 a16 16 0 0 1 16 16 v82 l-9 8 -9 -8 -9 8 -9 -8 -9 8 -9 -8 -9 8 -9 -8 -9 8 -9 -8 v-82 a16 16 0 0 1 16 -16 z"
          fill={PAPER}
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Ledger lines */}
        <path d="M44 98 h30 M44 108 h20 M86 98 h10 M86 108 h10" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
        <circle cx="46" cy="72" r="6" fill={CHEEK} opacity="0.55" />
        <circle cx="94" cy="72" r="6" fill={CHEEK} opacity="0.55" />
        <Face pose={pose} />
        {pose === 'celebrating' && <Sparkles />}
      </g>
    </svg>
  );
}

function Face({ pose }: { pose: MascotPose }) {
  const eye = (cx: number, dx = 0, dy = 0) => (
    <g>
      <ellipse cx={cx} cy={56} rx={6} ry={8} fill={INK} />
      <circle cx={cx + 2 + dx} cy={53 + dy} r={2} fill={PAPER} />
    </g>
  );
  const happyEye = (cx: number) => (
    <path d={`M${cx - 6} 58 q6 -8 12 0`} stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
  );
  const stroke = { stroke: INK, strokeWidth: 4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (pose) {
    case 'greeting':
      return (
        <g>
          {eye(58)}
          {eye(82)}
          <path d="M60 72 q10 12 20 0 z" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </g>
      );
    case 'thinking':
      return (
        <g>
          {eye(58, 1.5, -2)}
          {eye(82, 1.5, -2)}
          <path d="M54 42 l9 -2" {...stroke} />
          <path d="M77 40 l9 1" {...stroke} />
          <path d="M64 75 h12" {...stroke} />
        </g>
      );
    case 'explaining':
      return (
        <g>
          {eye(58)}
          {eye(82)}
          <path d="M76 41 q6 -4 12 0" {...stroke} />
          <ellipse cx="70" cy="75" rx="5" ry="4" fill={INK} />
        </g>
      );
    case 'reassuring':
      return (
        <g>
          {happyEye(58)}
          {happyEye(82)}
          <path d="M62 72 q8 7 16 0" {...stroke} />
        </g>
      );
    case 'celebrating':
      return (
        <g>
          {happyEye(58)}
          {happyEye(82)}
          <path d="M58 70 q12 16 24 0 z" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </g>
      );
    case 'supportive':
      return (
        <g>
          {eye(58, 0, 1)}
          {eye(82, -1, 1)}
          <path d="M51 44 l11 -4" {...stroke} />
          <path d="M78 40 l11 4" {...stroke} />
          <path d="M63 76 q7 -3 14 0" {...stroke} />
        </g>
      );
    default:
      return (
        <g>
          {eye(58)}
          {eye(82)}
          <path d="M62 72 q8 7 16 0" {...stroke} />
        </g>
      );
  }
}

function Arms({ pose }: { pose: MascotPose }) {
  const arm = { stroke: 'var(--mascot-ink)', strokeWidth: 4, fill: 'none', strokeLinecap: 'round' as const };
  const hand = (cx: number, cy: number) => <circle cx={cx} cy={cy} r={6} fill={PAPER} stroke={INK} strokeWidth="4" />;
  switch (pose) {
    case 'greeting':
      return (
        <g>
          <path d="M22 80 q-10 8 -8 20" {...arm} />
          {hand(14, 102)}
          <g className="mascot__wave">
            <path d="M118 74 q14 -8 14 -28" {...arm} />
            {hand(132, 42)}
          </g>
        </g>
      );
    case 'thinking':
      return (
        <g>
          <path d="M22 80 q-10 8 -8 20" {...arm} />
          {hand(14, 102)}
          <path d="M118 84 q8 6 -2 0" {...arm} />
          <circle className="mascot__dot" cx="128" cy="30" r="3" fill={INK} />
          <circle className="mascot__dot" cx="134" cy="18" r="2.5" fill={INK} />
        </g>
      );
    case 'explaining':
      return (
        <g>
          <path d="M22 80 q-10 8 -8 20" {...arm} />
          {hand(14, 102)}
          <path d="M118 76 q10 -2 16 -10" {...arm} />
          {hand(134, 64)}
        </g>
      );
    case 'celebrating':
      return (
        <g>
          <path d="M22 72 q-12 -6 -12 -28" {...arm} />
          {hand(10, 40)}
          <path d="M118 72 q12 -6 12 -28" {...arm} />
          {hand(130, 40)}
        </g>
      );
    case 'supportive':
      return (
        <g>
          <path d="M22 80 q-10 8 -8 20" {...arm} />
          {hand(14, 102)}
          <path d="M118 86 q12 4 16 14" {...arm} />
          {hand(134, 104)}
        </g>
      );
    default:
      return (
        <g>
          <path d="M22 80 q-10 8 -8 20" {...arm} />
          {hand(14, 102)}
          <path d="M118 80 q10 8 8 20" {...arm} />
          {hand(126, 102)}
        </g>
      );
  }
}

function Sparkles() {
  const star = (x: number, y: number, r: number) => (
    <path
      d={`M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`}
      fill="var(--mascot-cheek)"
      stroke={INK}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  );
  return (
    <g className="mascot__sparkles">
      {star(28, 16, 7)}
      {star(114, 10, 5)}
    </g>
  );
}
