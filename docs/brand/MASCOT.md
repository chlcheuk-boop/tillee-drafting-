# Mascot spec

**Asset status: streamlined rig (built with the svg-mascot-creator skill), pending the original files.** The character is the tillee.io homepage guide: a round purple creature with big round glasses, a red bow tie, small arms and feet. It's rebuilt as a fixed rig with swappable limbs in `src/brand/mascot/rig.ts`. That one source drives the React component, the exported files in `assets/mascot/`, and the motion frames. When the original artwork arrives, redraw it in the rig (same anchors and groups), and every pose and animation updates.

## What changed from the first redraw

- **Smooth silhouette.** The fuzzy edge and gradient-like highlight are gone; the body is a flat circle with one right-side shade at 0.55 opacity, plus a ground shadow.
- **Consistent construction.** Limbs are double-stroked tubes with hand circles, and every pose shares the same body, glasses and bow tie byte for byte (checked by `rig.test.ts`).
- **Motion-ready.** Named groups (`mascot`, `arm-near`, `arm-far`, `leg-*`, `head`, `eyes`, `fx`) rotate around fixed anchors, so poses animate without redrawing.

See `assets/mascot/README.md` for the rig spec, motions and frame exports.

## Drawing grammar

- **Body:** a smooth circle (`#7A52E6`) with a right-side shade crescent (`#5A36C4`, 0.55 opacity) and stub legs.
- **Glasses:** white lenses with plum rims (`#2A2340`) and a bridge. Expressions come from the pupils, brows, mouth and arms.
- **Accent:** red `#E0303A` appears only on the bow tie and FX marks (wave arcs, sparks, thought dots).
- **viewBox:** `-12 0 264 240`.

## Poses

| App pose (rig pose) | Use | Never |
|---|---|---|
| `neutral` (neutral, idle + blink) | Desktop progress column beside questions | Speech bubble repeating the question |
| `greeting` (waving, wave ×2) | Welcome (one wave, about 1.6s, once) | Looping |
| `thinking` (thinking, think) | Real processing only | Pretending to calculate or review |
| `explaining` (pointing, explain) | "Why we ask" with a quoted line, as on the homepage | Wit before the reason |
| `reassuring` (reassuring, reassure) | Saved and completion; calm result, including when money may be owed | Celebrating a refund amount |
| `celebrating` (celebrating, celebrate) | Section breaks (acknowledging effort) | Results, owed amounts, more withholding |
| `supportive` (supportive, support) | Upload or save failure with retry | Shocked, blaming or laughing |

## Usage

- **Homepage pattern:** the mascot sits small, beside a short line in quotes in muted text. It speaks in the first person ("I'll do the typing where I can…"). The checkup reuses this on the welcome screen and in "Why we ask".
- **Size:** minimum 32px (enforced). Typical sizes are 56–72 inline and 96 on the hero or aside.
- **Clear space:** at least 25% of its width on every side.
- **Hierarchy:** never larger than the heading block, and never between a prompt and its answers. On mobile question screens it's hidden.
- **Accessibility:** decorative (`aria-hidden`). Anything it "says" is real text beside it.
- **Motion:** at most one gesture per appearance. Everything collapses under `prefers-reduced-motion`. Motion never delays navigation.

## Still needed

1. The original mascot and logo files (SVG preferred), to reconcile the rig's proportions and replace the font-approximated wordmark.
2. A motion designer's pass on timing, using `assets/mascot/frames/` and `frames.json` as the source.
3. Optionally, a Lottie or Rive export built from those frames.
