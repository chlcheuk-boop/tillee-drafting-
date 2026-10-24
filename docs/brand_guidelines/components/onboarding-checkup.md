# Onboarding checkup: as-built spec

Built against **proposed** tokens. Re-check every value against `DESIGN.md` when porting.

## Structure

`CheckupShell` holds the sticky top bar (Back or brand, live save status) and section progress. Below that is the main area: a stage of at most 640px, plus a mascot aside at 900px and wider.

Views: `welcome → [intro] → question… → review → processing → result`.

## Components

| Component | File | Notes |
|---|---|---|
| CheckupShell | `components/CheckupShell.tsx` | Section progress is an `<ol>` in a nav, with `aria-current="step"` and a visible label "Section n of N: Title". Save status is `role=status`. |
| QuestionScreen | `components/QuestionScreen.tsx` | `h1` gets focus on entry. Previous-answer chip (same section only). Help is wired with `aria-describedby`. Fallback and payroll notices. Errors are `role=alert` and receive focus. Collapsible "Why we ask". |
| QuestionRenderer | `components/QuestionRenderer.tsx` | Type → input map. No branching or copy logic. |
| Choice cards | `inputs/ChoiceInputs.tsx` | Native radio/checkbox laid over the card. Selected = primary border + tint + filled check (works without color). Layouts: `cards` and `buttons`. Minimum height 56px. |
| Text, related fields | `inputs/TextInputs.tsx` | Persistent labels; autocomplete hints. |
| Currency | `inputs/TextInputs.tsx` | `inputMode=decimal`, `$` prefix, period in the label, integer cents, blank ≠ 0. |
| Number | `inputs/TextInputs.tsx` | `inputMode=numeric`, unit in the label. |
| Date | `inputs/TextInputs.tsx` | Month / Day / Year fields, no calendar-only entry. |
| Upload | `inputs/UploadAndImport.tsx` | Button plus drag and drop. Type and size checked before upload. Per-file status: uploading, processing, processed, noTaxData, failed. Retry and remove. Continue is blocked while processing; "Skip, I'll type it in" is always available. |
| Confirm imported | `inputs/UploadAndImport.tsx` | Source, as-of date and period, the amount, then "Looks right" or "Change this number". A newer import raises a conflict card (use newer or keep mine). |
| Review | `Screens.tsx` | Grouped by section. Each row has an Edit button with an sr-only question name. Unresolved rows are flagged. CTA uses `aria-disabled` and jumps to the first issue. |
| Processing | `Screens.tsx` | Real steps only (save → documents if any → estimate). Failure stops the list; nothing after a failure shows a check. |
| Result | `Screens.tsx` | Separate states for unavailable, processing, missing inputs, error (with retry) and demo (badge plus caveat). |

## States checklist

Choice: unselected, hover, focus-visible (3px focus ring), selected, error (group `aria-invalid` + message). Buttons: primary, primary aria-disabled, secondary, ghost. Save: idle, saving, saved, error + retry.

## Layout and motion

- Gutter 20px; touch targets at least 44px; inputs 52px.
- The footer is sticky with a fade backdrop and safe-area padding, and turns static below 500px viewport height.
- Step enter: 240ms fade + 8px rise. Selection feedback: 160ms. All motion is removed under reduced motion.
