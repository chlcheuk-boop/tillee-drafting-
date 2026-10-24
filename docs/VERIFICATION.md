# Verification

All runs used fixture services and synthetic data, in Chromium 390×844 unless noted.

## Automated

- `npm run typecheck`: clean (strict TS)
- `npm test`: 40 passing
  - Config integrity: rules, validators and copy keys exist; IDs and option values are unique
  - Branching: simple path skips advanced questions; follow-ups appear; changing a controlling answer removes its dependents from the submission and restores them in the draft if changed back; edits surface newly required follow-ups; imports are used only for the selected source and matching tax year; an unavailable payroll import falls back to manual entry; upload fallbacks wait for the upload to settle
  - Answer states: blank, zero and unknown stay distinct; unknown is submitted as a status, never as 0; currency parsing keeps cents and rejects bad formats; dates must exist and fall in the tax year
  - Multi-choice: "None" is exclusive in both directions
  - Imports: a newer import flags a confirmed value instead of overwriting it
  - Progress: empty sections are omitted
  - Resume: drops answers for removed questions and answers with changed shapes; never resumes past a newly required question
  - SaveTracker: an older response can't mark newer edits saved; a failure is never shown as saved; retry works
  - Contrast: 22 light and dark token pairs meet WCAG AA (4.5:1 text, 3:1 UI)
- `npm run build`: succeeds

## Browser scenarios (Playwright)

| Scenario | Result |
|---|---|
| Full payroll path → review → save → result | ✅ no console errors |
| Continue with no answer | ✅ inline error, focus moved to the error |
| Invalid date (Feb 30), invalid currency (12.345) | ✅ specific messages, entry preserved |
| Edit filing status in review from joint to single | ✅ spouse rows removed from review and from the submitted payload |
| Unsupported file type | ✅ rejected before upload with a clear message |
| Non-tax business PDF | ✅ "couldn't find pay details" → manual fallback with explanation notice |
| Synthetic pay stub | ✅ confirmation shows "From your uploaded document · as of …" |
| Draft save fails | ✅ shows "Couldn't save. Your answers are still here." with retry, never "Saved"; retry → saved |
| `0` entered as an amount | ✅ accepted as a real zero |
| Simulated refresh | ✅ resumes at the correct step |
| Final save fails | ✅ step marked failed, estimate step not run, retry offered |
| Double-clicking retry | ✅ exactly one completion recorded |
| Demo estimate | ✅ "Demo data: not a real estimate" badge, plus a caveat that it isn't a guarantee |
| Widths 320 / 768 / 1440 | ✅ no horizontal overflow; desktop keeps the form about 640px wide with the mascot alongside |
| 200% root font size | ✅ no horizontal overflow |
| Keyboard only | ✅ Enter starts; focus moves to the question heading; Tab/Space/arrow keys select; Enter submits |

## Design and copy passes

- **Apple design review** (the skill's reference pages weren't installed, so findings were made against the skill's distilled rules and labelled as judgment, without HIG quotes). Fixed:
  - Added a dark appearance that follows the system setting, with every pair checked to AA (the contrast tests now cover 22 pairs)
  - Body text raised to 17px
  - Removed the focus ring that appeared on headings focused by code
  - Moved the privacy line above the call to action
  - Stopped echoing bare "Yes"/"No" answers without context
  - Desktop now uses a two-column layout (welcome summary card; live section checklist beside questions) with no sticky footer, and the background gradient covers the full height
- **Clean user-facing text:** hidden-Unicode inspection found 0 suspicious characters before and after. Prose rewritten for directness, and one factual fix: the "why we ask" line for other income claimed no tax is withheld, which is wrong for a second job.
- Re-ran both browser scripts after these changes: all scenarios pass, with no horizontal overflow at 320/768/1024/1440 and no console errors.

## Not yet verified

- A real screen reader (VoiceOver/NVDA). Semantics are in place (radiogroup and group, labelled headings, `role=alert` errors, live save status) but nobody has listened to them.
- A real mobile on-screen keyboard covering the sticky footer. The footer turns static below 500px height as a mitigation.
- An automated axe scan.
- Anything against the real Tillee app, the longer Tax Checkup, or the employer and bank surfaces. They don't exist in this repo, so "keeps current behavior" can't be claimed.
