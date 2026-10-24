import { useEffect, useState } from 'react';
import { Mascot } from './brand/Mascot';
import { StyleShowcase } from './pages/StyleShowcase';
import {
  completionCount,
  documentFixture,
  estimateFixture,
  lastSubmission,
  payrollFixture,
  persistenceFixture,
  resetFixtures,
  scenario,
} from './checkup/adapters/fixtures';
import type { CheckupServices } from './checkup/adapters/contracts';
import { CheckupShell } from './checkup/components/CheckupShell';
import { QuestionScreen } from './checkup/components/QuestionScreen';
import {
  ProcessingScreen,
  ResultScreen,
  ReviewScreen,
  SectionIntroScreen,
  WelcomeScreen,
} from './checkup/components/Screens';
import { onboardingConfig } from './checkup/config/onboarding';
import { useCheckup } from './checkup/useCheckup';

// FIXTURE services. Swap for real adapters when wiring into the Tillee app.
const services: CheckupServices = {
  persistence: persistenceFixture,
  payroll: payrollFixture,
  documents: documentFixture,
  estimate: estimateFixture,
};

function Checkup() {
  const c = useCheckup(onboardingConfig, services);
  const v = c.view;
  const showProgress = v.kind === 'question' || v.kind === 'intro';
  const canBack = c.canGoBack && v.kind !== 'processing' && v.kind !== 'result' && v.kind !== 'welcome';
  return (
    <CheckupShell
      progress={showProgress ? c.progress : undefined}
      saveStatus={c.saveStatus}
      onRetrySave={() => void c.retrySave()}
      onBack={canBack ? c.back : undefined}
      aside={v.kind === 'question' ? <Mascot pose="neutral" size={120} animate={false} /> : undefined}
    >
      {v.kind === 'loading' && <p role="status">Loading…</p>}
      {v.kind === 'welcome' && <WelcomeScreen c={c} />}
      {v.kind === 'intro' && <SectionIntroScreen c={c} sectionId={v.sectionId} />}
      {v.kind === 'question' && <QuestionScreen key={v.id} c={c} id={v.id} />}
      {v.kind === 'review' && <ReviewScreen c={c} />}
      {v.kind === 'processing' && <ProcessingScreen c={c} />}
      {v.kind === 'result' && <ResultScreen c={c} />}
    </CheckupShell>
  );
}

/** Prototype-only scenario controls for exercising fixture states. */
function PrototypePanel({ onRemount }: { onRemount: (reset: boolean) => void }) {
  const [, force] = useState(0);
  // Fixture state lives outside React; refresh the readout periodically.
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 500);
    return () => clearInterval(id);
  }, []);
  const set = <K extends keyof typeof scenario>(k: K, v: (typeof scenario)[K]) => {
    scenario[k] = v;
    force((n) => n + 1);
  };
  return (
    <aside className="proto" aria-label="Prototype controls">
      <details onToggle={() => force((n) => n + 1)}>
        <summary>Prototype controls (fixture data, not part of the product)</summary>
        <div className="proto__grid">
          <label>
            Payroll
            <select value={scenario.payroll} onChange={(e) => set('payroll', e.target.value as typeof scenario.payroll)}>
              <option value="connected">Connected</option>
              <option value="unavailable">Unavailable</option>
              <option value="updatedValues">Newer values (conflict test)</option>
            </select>
          </label>
          <label>
            Estimate
            <select value={scenario.estimate} onChange={(e) => set('estimate', e.target.value as typeof scenario.estimate)}>
              <option value="unavailable">Unavailable (default)</option>
              <option value="processing">Still processing</option>
              <option value="missingInputs">Missing inputs</option>
              <option value="error">Error</option>
              <option value="demo">Demo result (labelled)</option>
            </select>
          </label>
          <label>
            <input type="checkbox" checked={scenario.saveFails} onChange={(e) => set('saveFails', e.target.checked)} /> Draft saves fail
          </label>
          <label>
            <input type="checkbox" checked={scenario.completeFails} onChange={(e) => set('completeFails', e.target.checked)} /> Final save fails
          </label>
          <label>
            <input type="checkbox" checked={scenario.documentFails} onChange={(e) => set('documentFails', e.target.checked)} /> Uploads fail
          </label>
          <label>
            Latency
            <select value={scenario.latencyMs} onChange={(e) => set('latencyMs', Number(e.target.value))}>
              <option value={0}>0 ms</option>
              <option value={600}>600 ms</option>
              <option value={2000}>2 s</option>
            </select>
          </label>
          <button type="button" className="btn btn--secondary btn--small" onClick={() => onRemount(false)}>
            Simulate refresh (resume)
          </button>
          <button type="button" className="btn btn--secondary btn--small" onClick={() => onRemount(true)}>
            Reset everything
          </button>
          <a className="btn btn--secondary btn--small" href="#/style">
            Open style showcase
          </a>
        </div>
        <p>
          Upload any file named like <code>synthetic-paystub.pdf</code> to simulate a successful extraction. Any other PDF/JPG/PNG is
          reported as containing no pay details. Completions recorded: {completionCount()}.
        </p>
        {lastSubmission && (
          <>
            <p>Last submitted payload (synthetic):</p>
            <pre>{JSON.stringify(lastSubmission, null, 2)}</pre>
          </>
        )}
      </details>
    </aside>
  );
}

export function App() {
  const [route, setRoute] = useState(() => window.location.hash);
  const [mountKey, setMountKey] = useState(0);
  useEffect(() => {
    const on = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  if (route === '#/style') return <StyleShowcase />;
  return (
    <>
      <Checkup key={mountKey} />
      <PrototypePanel
        onRemount={(reset) => {
          if (reset) resetFixtures();
          setMountKey((k) => k + 1);
        }}
      />
    </>
  );
}
