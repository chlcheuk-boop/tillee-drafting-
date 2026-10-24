import { MASCOT_MIN_SIZE, MASCOT_POSES, Mascot, Wordmark, type MascotPose } from '../brand/Mascot';
import { Icon } from '../brand/Icon';
import { CONTRAST_PAIRS, contrastRatio } from '../brand/contrast';
import { MOTIONS, REDUCED_MOTION_CSS, buildMascotSvg, motionCss } from '../brand/mascot/rig';

/** Showcase-only: a looping, self-scoped copy of each motion (unique class scope per card). */
function animatedSvg(name: string) {
  const m = MOTIONS.find((x) => x.name === name)!;
  const scope = `.show-${name} `;
  const css = `${motionCss(m, 'class', scope, 'infinite')}\n${REDUCED_MOTION_CSS('class', scope)}`;
  return `<div class="show-${name}" style="line-height:0"><style>${css}</style>${buildMascotSvg(m.pose, { hooks: 'class' }).replace('<svg ', '<svg style="width:100%;height:auto;overflow:visible" ')}</div>`;
}

/**
 * Living showcase for the checkup components and the PROPOSED brand layer,
 * modelled on the documented /style route in the Tillee app (not inspected).
 */
const POSE_USE: Record<MascotPose, string> = {
  neutral: 'Quiet presence beside standard questions (desktop only). Brand mark stand-in.',
  greeting: 'Welcome screen only. One wave, then still.',
  thinking: 'Real processing in progress. Never while idle.',
  explaining: '“Why we ask” and term explanations.',
  reassuring: 'Saved / completion. Also calm result explanations, including when money may be owed.',
  celebrating: 'Small acknowledgment of effort at section breaks. Never for a refund amount.',
  supportive: 'Upload or save failure with a retry. Never shocked or laughing.',
};

const TOKENS = [
  ['canvas (cream)', '#fff9f2'],
  ['hero lavender', '#f4ecfd'],
  ['surface', '#ffffff'],
  ['ink (plum)', '#2a2340'],
  ['ink-muted', '#5d566e'],
  ['primary (violet)', '#6941d9'],
  ['primary-tint', '#f3edff'],
  ['success', '#1d7348'],
  ['amber', '#7a4b00'],
  ['danger', '#a3203a'],
  ['mascot-body', '#7a52e6'],
  ['mascot-bow', '#e0303a'],
];

export function StyleShowcase() {
  return (
    <div className="showcase">
      <p>
        <a href="#checkup">← Back to checkup</a>
      </p>
      <p>
        <Wordmark />
      </p>
      <h1>Checkup components & brand</h1>
      <div className="proposal-banner" role="note">
        <strong>Derived from the tillee.io homepage, not yet from the design files.</strong> Colours were sampled from a homepage
        screenshot and nudged for WCAG AA contrast; the mascot is a vector redraw of the homepage character and the wordmark is a
        font approximation. Reconcile with <code>DESIGN.md</code>, <code>Tillee_Brand_Guidelines.md</code> and the original asset
        files.
      </div>

      <section>
        <h2>Mascot pose sheet (svg-mascot-creator rig)</h2>
        <div className="pose-grid">
          {MASCOT_POSES.map((p) => (
            <div className="pose-card" key={p}>
              <Mascot pose={p} size={96} />
              <strong>{p}</strong>
              <span>{POSE_USE[p]}</span>
            </div>
          ))}
        </div>
        <h3>Minimum size ({MASCOT_MIN_SIZE}px) and small-size check</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
          <Mascot size={32} animate={false} />
          <Mascot size={64} animate={false} />
          <Mascot size={96} animate={false} />
          <span style={{ background: '#2a2340', padding: 8, borderRadius: 12 }}>
            <Mascot size={64} animate={false} />
          </span>
        </div>
      </section>

      <section>
        <h2>Motion (generated from the rig)</h2>
        <p>
          Every motion rotates or moves named groups around fixed anchors; no shape is ever morphed. Frame exports at 12 fps and a
          timing spec live in <code>assets/mascot/frames/</code>.
        </p>
        <div className="pose-grid">
          {MOTIONS.filter((m) => m.name !== 'blink').map((m) => (
            <div className="pose-card" key={m.name}>
              <span dangerouslySetInnerHTML={{ __html: animatedSvg(m.name) }} style={{ width: 120, display: 'block' }} />
              <strong>
                {m.name} · {m.durationMs} ms{m.loop ? ' · loop' : ''}
              </strong>
              <span>{m.use}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Colour tokens (proposed)</h2>
        <div className="swatches">
          {TOKENS.map(([n, v]) => (
            <div className="swatch" key={n}>
              <div className="swatch__chip" style={{ background: v }} />
              <div className="swatch__meta">
                <strong>{n}</strong>
                <br />
                {v}
              </div>
            </div>
          ))}
        </div>
        <h3>Contrast checks</h3>
        <ul>
          {CONTRAST_PAIRS.map((p) => {
            const r = contrastRatio(p.fg, p.bg);
            return (
              <li key={p.fgName + p.bgName}>
                {p.fgName} on {p.bgName}: {r.toFixed(2)}:1 {r >= p.min ? '✓' : '✗'} (min {p.min}:1)
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2>Option card states</h2>
        <div className="choices" style={{ maxWidth: 480 }}>
          <label className="choice">
            <input type="radio" name="demo" />
            <span className="choice__icon">
              <Icon name="link" />
            </span>
            <span className="choice__text">
              <span className="choice__label">Unselected</span>
              <span className="choice__help">Helper text wraps across lines on narrow screens without truncation.</span>
            </span>
            <span className="choice__mark choice__mark--radio" />
          </label>
          <label className="choice choice--selected">
            <input type="radio" name="demo" defaultChecked />
            <span className="choice__icon">
              <Icon name="document" />
            </span>
            <span className="choice__text">
              <span className="choice__label">Selected (border + tint + check)</span>
            </span>
            <span className="choice__mark choice__mark--radio">
              <Icon name="check" size={16} />
            </span>
          </label>
          <label className="choice choice--selected">
            <input type="checkbox" defaultChecked />
            <span className="choice__text">
              <span className="choice__label">Multi-select, selected</span>
            </span>
            <span className="choice__mark choice__mark--check">
              <Icon name="check" size={16} />
            </span>
          </label>
        </div>
      </section>

      <section>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn--primary">Continue</button>
          <button className="btn btn--primary" aria-disabled="true">
            Blocked
          </button>
          <button className="btn btn--secondary">Secondary</button>
          <button className="btn btn--ghost">I&apos;m not sure</button>
        </div>
      </section>

      <section>
        <h2>Motion tokens (proposed)</h2>
        <ul>
          <li>
            <code>--motion-select</code> 160ms: selection feedback
          </li>
          <li>
            <code>--motion-step</code> 240ms: step enter (fade + 8px rise)
          </li>
          <li>Reduced motion: all animations and transitions collapse; spinner becomes static.</li>
        </ul>
      </section>
    </div>
  );
}
