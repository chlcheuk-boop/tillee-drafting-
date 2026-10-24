# Mascot spec

**Asset status: redraw, pending the original files.** The character comes from the tillee.io homepage: a round, fuzzy purple creature with big round glasses, a red bow tie, small arms and feet, often waving beside a quoted line. `src/brand/Mascot.tsx` is a vector redraw made from a low-resolution homepage screenshot. Its proportions are approximate. Swap in the original artwork when available, and keep the `pose` API.

## Drawing grammar

- **Body:** a fuzzy circle (`--mascot-body`) with a soft top-left highlight and darker feet (`--mascot-shade`).
- **Glasses:** two white lenses with plum rims (`--mascot-rim`) and a bridge. Expressions live in the pupils, the brows above the rims, the mouth and the arms. The body never changes shape.
- **Bow tie:** `--mascot-bow` with a darker knot. It's the character's one warm accent; nothing else in the UI uses that red.
- **viewBox:** 140×140.

## Poses

| Pose | Use | Never |
|---|---|---|
| `neutral` | Desktop progress column beside questions | Speech bubble repeating the question |
| `greeting` | Welcome (one wave, about 1.6s, once) | Looping |
| `thinking` | Real processing only | Pretending to calculate or review |
| `explaining` | "Why we ask" with a quoted line, as on the homepage | Wit before the reason |
| `reassuring` | Saved and completion; calm result, including when money may be owed | Celebrating a refund amount |
| `celebrating` | Section breaks (acknowledging effort) | Results, owed amounts, more withholding |
| `supportive` | Upload or save failure with retry | Shocked, blaming or laughing |

## Usage

- **Homepage pattern:** the mascot sits small, beside a short line in quotes in muted text. It speaks in the first person ("I'll do the typing where I can…"). The checkup reuses this on the welcome screen and in "Why we ask".
- **Size:** minimum 32px (enforced). Typical sizes are 56–72 inline and 96 on the hero or aside.
- **Clear space:** at least 25% of its width on every side.
- **Hierarchy:** never larger than the heading block, and never between a prompt and its answers. On mobile question screens it's hidden.
- **Accessibility:** decorative (`aria-hidden`). Anything it "says" is real text beside it.
- **Motion:** at most one gesture per appearance. Everything collapses under `prefers-reduced-motion`. Motion never delays navigation.

## Still needed

1. The original mascot and logo files (SVG preferred), to replace the redraw and the font-approximated wordmark.
2. Illustrator passes on the seven poses in the original style.
3. Static exports: `tillee-mascot-{pose}.svg` plus @1x/@2x PNGs at 48, 96 and 192px.
