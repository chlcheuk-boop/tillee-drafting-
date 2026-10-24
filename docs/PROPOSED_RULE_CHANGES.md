# Proposed rule changes (awaiting founder approval)

Under repo governance, `DESIGN.md` and `Tillee_Brand_Guidelines.md` own the rules, and changes are made in place with a one-line entry in `DESIGN_LOG_ARCHIVE.md` after founder approval. None of those files were available, so each proposal below is written as the change to make **if** the current rule differs. Preview everything at `#style`.

| # | Target doc / section | Proposed rule | Preview |
|---|---|---|---|
| 1 | DESIGN.md › Forms | Conversational checkups show one conceptual question (or one tightly related field group) per screen, with an explicit Continue. Auto-advance is off by default and never used for multi-select or consent. | Any question screen |
| 2 | DESIGN.md › Progress | Branching flows use section-based progress derived from the applicable path, never a fixed question count. | Top bar |
| 3 | DESIGN.md › Selection | Selected state = primary border + primary tint + filled check mark. Color is never the only signal. | `#style` › Option card states |
| 4 | DESIGN.md › Status truthfulness | "Saved" and success checks appear only after the backend confirms. Processing lists show only real steps and stop on failure. | Prototype controls › failure toggles |
| 5 | DESIGN.md › Motion | `--motion-select` 160ms and `--motion-step` 240ms; full reduced-motion fallback; motion never delays navigation. | `#style` › Motion |
| 6 | Brand › Mascot | Seven-pose set and usage table for the existing homepage character (see `docs/brand/MASCOT.md`). The artwork is a redraw pending the original files. | `#style` › Pose sheet |
| 7 | Brand › Voice | "Clarity, without the tax panic" story and voice table (see `docs/brand/BRAND_STORY_AND_VOICE.md`). | Welcome, intros, errors |
| 8 | Brand › Color | Homepage colors adjusted for AA where needed, plus a new dark palette. The tokens are in `src/styles.css`, with checks in `src/brand/contrast.ts`. | `#style` › Colour tokens |

## Draft `DESIGN_LOG_ARCHIVE.md` entries (add only on approval)

```
2026-10-XX · DESIGN.md › Forms: one-question-per-screen conversational checkup pattern with explicit Continue (#1).
2026-10-XX · DESIGN.md › Progress: section-based progress for branching flows (#2).
2026-10-XX · DESIGN.md › Selection: selected state must include a non-colour indicator (#3).
2026-10-XX · DESIGN.md › Status: success states only after backend confirmation (#4).
2026-10-XX · DESIGN.md › Motion: select/step durations and reduced-motion rule (#5).
2026-10-XX · Brand › Mascot: pose set and usage rules (#6).
2026-10-XX · Brand › Voice: "Clarity, without the tax panic" voice table (#7).
```

## Product decisions flagged (not invented)

- Privacy promise (can HR see answers?): neutral placeholder until permissions and approved copy are verified.
- Whether `unknown` is acceptable for the withholding and income fields (enabled in the fixture config; this is a product rule).
- Stale-branch policy for server drafts (see `INTEGRATION_AND_MIGRATION.md`).
- Final onboarding question list and order.
