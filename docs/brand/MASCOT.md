# Mascot spec (PROPOSED PLACEHOLDER)

**Asset status: temporary.** No existing Tillee mascot or logo files were available, so `src/brand/Mascot.tsx` is a code-native stand-in. The first step with real assets is to inspect the current character (silhouette, proportions, colors, small-size behavior) and redraw these poses in its style. Don't adopt the receipt character just because it exists here. The species was not chosen from the demo account name.

## Character

- **Concept:** a small receipt with a torn zigzag hem, a ledger-line belly, big oval eyes, and warm cheeks.
- **Drawing grammar:** 4px ink stroke, round joins and caps; paper body `--mascot-paper`; ink `--mascot-ink`; cheeks and sparkles `--mascot-cheek`; ledger `--mascot-ledger`; line-and-circle arms. Expression changes only in the eyes, brows, mouth and arms. The body never changes shape.
- **viewBox:** 140×150.

## Poses

| Pose | Use | Never |
|---|---|---|
| `neutral` | Desktop aside on question screens; header mark stand-in | Speech bubble repeating the question |
| `greeting` | Welcome (one wave, about 1.6s, once) | Looping |
| `thinking` | Real processing only | Pretending to calculate or review |
| `explaining` | "Why we ask" and term explanations | Wit before the reason |
| `reassuring` | Saved and completion; calm result, including when money may be owed | Celebrating a refund amount |
| `celebrating` | Section breaks (acknowledging effort) | Results, owed amounts, more withholding |
| `supportive` | Upload or save failure with retry | Shocked, blaming or laughing |

## Usage

- **Size:** minimum 40px (`MASCOT_MIN_SIZE`, which the component enforces). Typical sizes are 40 (header), 48 (inline explain), 88–120 (hero or aside).
- **Clear space:** at least 25% of its rendered width on every side.
- **Backgrounds:** canvas, surface, or a dark ink background (see the showcase). Don't place it on busy illustration or on the primary-colored fill.
- **Hierarchy:** never larger than the screen's heading block, and never between the prompt and its answers. On mobile question screens it's hidden.
- **Accessibility:** decorative by default (`aria-hidden`). Pass `label` only if it conveys meaning not given in text, which this flow never needs.
- **Motion:** at most one gesture per appearance (wave, hop) or a subtle bob while thinking. Everything collapses under `prefers-reduced-motion`. Motion never delays navigation.

## Final illustration work needed

1. Reconcile with the existing mascot or logo, or get founder approval for a new direction.
2. Have an illustrator draw the 7 poses (SVG, same viewBox), plus a wordmark lockup.
3. Export a static set: `tillee-mascot-{pose}.svg` and PNGs at @1x/@2x at 48, 96 and 192px.
4. Optionally add Lottie or CSS motion, with static fallbacks.
