/**
 * Tillee mascot for the app, rendered from the shared rig in
 * ./mascot/rig.ts (the same source as assets/mascot/*). Inline use takes class
 * hooks instead of ids so several mascots can share a page; their motion CSS
 * is injected once and scoped by a per-motion class.
 */
import { useMemo } from 'react';
import {
  APP_POSE_TO_RIG,
  CANVAS,
  MOTIONS,
  REDUCED_MOTION_CSS,
  buildMascotSvg,
  motionCss,
} from './mascot/rig';

export type MascotPose = keyof typeof APP_POSE_TO_RIG;

export const MASCOT_POSES = Object.keys(APP_POSE_TO_RIG) as MascotPose[];

/** Minimum rendered width; below this the glasses stop reading. */
export const MASCOT_MIN_SIZE = 32;

/** Which motion each app pose plays, and how many times (undefined = spec default). */
const POSE_MOTION: Record<MascotPose, { motion: string; iterations?: number }> = {
  neutral: { motion: 'idle' },
  greeting: { motion: 'wave', iterations: 2 },
  thinking: { motion: 'think' },
  explaining: { motion: 'explain' },
  reassuring: { motion: 'reassure' },
  celebrating: { motion: 'celebrate' },
  supportive: { motion: 'support' },
};

let injected = false;
function injectMotionCss() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const blink = MOTIONS.find((m) => m.name === 'blink')!;
  const css = [
    ...Object.values(POSE_MOTION).map(({ motion, iterations }) => {
      const m = MOTIONS.find((x) => x.name === motion)!;
      return motionCss(m, 'class', `.mascot--${motion} `, iterations);
    }),
    motionCss(blink, 'class', '.mascot--blink '),
    REDUCED_MOTION_CSS('class', '.mascot '),
  ].join('\n');
  const el = document.createElement('style');
  el.dataset.mascot = '';
  el.textContent = css;
  document.head.appendChild(el);
}

type Props = {
  pose?: MascotPose;
  /** Rendered width in px. */
  size?: number;
  /** Provide a label only when the mascot conveys meaning not present in text. */
  label?: string;
  animate?: boolean;
  className?: string;
};

export function Mascot({ pose = 'neutral', size = 96, label, animate = true, className }: Props) {
  const w = Math.max(size, MASCOT_MIN_SIZE);
  const svg = useMemo(() => buildMascotSvg(APP_POSE_TO_RIG[pose], { hooks: 'class' }), [pose]);
  if (animate) injectMotionCss();
  const motion = POSE_MOTION[pose].motion;
  const classes = [
    'mascot',
    animate ? `mascot--${motion}` : '',
    animate && pose !== 'reassuring' ? 'mascot--blink' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <span
      className={classes}
      style={{ width: w, height: (w * CANVAS.h) / CANVAS.w }}
      {...a11y}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
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
