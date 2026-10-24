import { MASCOT_MIN_SIZE, MASCOT_POSES, Mascot, type MascotPose } from '../brand/Mascot';
import { Icon } from '../brand/Icon';
import { CONTRAST_PAIRS, contrastRatio } from '../brand/contrast';

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
  ['canvas', '#f6f4ef'],
  ['surface', '#ffffff'],
  ['ink', '#1b2430'],
  ['ink-muted', '#4a5565'],
  ['primary', '#0b6e5b'],
  ['primary-tint', '#e3f2ee'],
  ['accent', '#ffb23e'],
  ['danger', '#b42318'],
  ['mascot-paper', '#fff6e0'],
  ['mascot-ledger', '#9ccfc3'],
];

export function StyleShowcase() {
  return (
    <div className="showcase">
      <p>
        <a href="#/">← Back to checkup</a>
      </p>
      <h1>Checkup components & brand proposal</h1>
      <div className="proposal-banner" role="note">
        <strong>Proposal, not approved rules.</strong> Tillee&apos;s real tokens, mascot and icon assets were not available. Everything
        below is a reviewable stand-in pending founder approval and reconciliation with <code>DESIGN.md</code> and{' '}
        <code>Tillee_Brand_Guidelines.md</code>.
      </div>

      <section>
        <h2>Mascot pose sheet (placeholder artwork)</h2>
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
          <Mascot size={40} animate={false} />
          <Mascot size={64} animate={false} />
          <Mascot size={96} animate={false} />
          <span style={{ background: '#1b2430', padding: 8, borderRadius: 12 }}>
            <Mascot size={64} animate={false} />
          </span>
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
