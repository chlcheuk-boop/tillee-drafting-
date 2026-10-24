# Tillee onboarding tax checkup: redesign slice

A working, reviewable employee onboarding flow that asks one question at a time, built on a reusable question system, with a proposed mascot and voice.

> **Status: standalone prototype on fixtures.** The Tillee app repository, `DESIGN.md`, brand guidelines, `/style`, assets, real question schema and APIs were **not available** to this work. Only this empty repository was accessible. Everything is built to be lifted into the real app, and every integration point is behind an interface. See [`docs/AUDIT.md`](docs/AUDIT.md) for exactly what was and wasn't verified.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (checkup); #/style for the showcase
npm test           # engine, branching, persistence and contrast tests
npm run typecheck
npm run build
```

Use the **Prototype controls** panel at the bottom of the page to switch fixture scenarios: payroll unavailable or updated (conflict), draft-save failure, final-save failure, upload failure, estimate states (unavailable, processing, missing inputs, error, labelled demo), latency, and "simulate refresh" for resume.

Uploads: a file named like `synthetic-paystub.pdf` simulates a successful extraction. Any other PDF/JPG/PNG (for example the business background PDFs) is honestly reported as having no pay details and falls back to manual entry.

## What's here

| Area | Location | Status |
|---|---|---|
| Question contracts (discriminated unions) | `src/checkup/types.ts` | Proposed |
| Question config (fixture questions) | `src/checkup/config/onboarding.ts` | **Fixture**: not the real question list |
| Content dictionary | `src/checkup/content/en.ts` | Proposed draft copy |
| Visibility, required and validator registries | `src/checkup/rules/registry.ts` | Proposed |
| Pure flow engine (path, validation, progress, submission, resume) | `src/checkup/engine/flow.ts` | Implemented and tested |
| Save sequencing (no false "Saved") | `src/checkup/engine/saveTracker.ts` | Implemented and tested |
| Integration contracts | `src/checkup/adapters/contracts.ts` | Proposed interfaces |
| Fixture services | `src/checkup/adapters/fixtures.ts` | **Fixture**: never ship |
| Flow controller hook | `src/checkup/useCheckup.ts` | Implemented |
| Renderers and screens | `src/checkup/components/` | Implemented |
| Mascot (7 poses) and icons | `src/brand/` | **Proposed placeholder artwork** |
| Tokens and styles | `src/styles.css` | **Proposed** stand-in tokens |
| Style showcase | `src/pages/StyleShowcase.tsx` (`#/style`) | Implemented |

## Docs

- [`docs/AUDIT.md`](docs/AUDIT.md): verification boundaries, gaps, and the audit to complete against the real app
- [`docs/VERIFICATION.md`](docs/VERIFICATION.md): checks run and the scenario results
- [`docs/CONTENT_EDITING.md`](docs/CONTENT_EDITING.md): how to change wording, options and questions
- [`docs/INTEGRATION_AND_MIGRATION.md`](docs/INTEGRATION_AND_MIGRATION.md): wiring real adapters, and moving the longer Tax Checkup onto this system
- [`docs/brand/BRAND_STORY_AND_VOICE.md`](docs/brand/BRAND_STORY_AND_VOICE.md): story, voice and tone
- [`docs/brand/MASCOT.md`](docs/brand/MASCOT.md): mascot spec and usage rules
- [`docs/brand_guidelines/components/onboarding-checkup.md`](docs/brand_guidelines/components/onboarding-checkup.md): as-built component spec
- [`docs/PROPOSED_RULE_CHANGES.md`](docs/PROPOSED_RULE_CHANGES.md): rule changes awaiting founder approval, with draft log entries

Out of scope for this phase: employer and bank interfaces, loans and RAL flows, W-4 changes, tax calculation.
