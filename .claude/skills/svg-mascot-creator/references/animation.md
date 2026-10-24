# Animation Reference

How to bring a static mascot pose to life **without changing its geometry**. Because the rig has fixed anchor points (shoulders, hips, neck) and flat, layer-ordered shapes, you animate by wrapping body parts in `<g>` groups and rotating/translating them around their anchor — the paths themselves never change.

Two golden rules:

1. **Never animate path `d` values.** Animate transforms on wrapper groups only. A rotating `<g>` around the shoulder anchor produces a wave; morphing the arm path produces bugs.
2. **Pivot at the anchor.** Every rotation's `transform-origin` is the anchor the limb already pivots from in the static poses (shoulders `(146,192)`/`(218,194)`, hips `~(159,348)`/`(201,348)`, neck base `~(180,150)`). This keeps motion anatomically plausible.

---

## Grouping convention (do this while authoring the neutral pose)

Add `id`'d wrapper groups so animation has something to target. This is the ONLY structural change animation requires — the shapes inside are identical to the static pose.

```svg
<svg viewBox="0 0 360 620" ...>
  <ellipse id="shadow" .../>            <!-- shadow stays put (or scales for bob) -->
  <g id="mascot">                       <!-- whole-body bob / breathe -->
    <!-- hips, legs, shoes -->
    <g id="leg-back"> ... </g>
    <g id="leg-front"> ... </g>
    <!-- torso, hem, collar, badge -->
    <g id="arm-far"> ...far arm strokes + hand... </g>
    <!-- held prop -->
    <g id="arm-near"> ...near arm strokes + hand... </g>
    <g id="head">                        <!-- head tilt pivots at neck -->
      <!-- neck, ears, face, hair, brows -->
      <g id="eyes"> ...pupils (+ glasses if you want them to blink)... </g>
      <!-- mouth, nose -->
    </g>
    <g id="fx"> ...accent motion arcs / sparks... </g>
  </g>
</svg>
```

Only add the groups a given animation needs — an idle bob needs just `#mascot` and `#eyes`. Groups cost zero visual change (a `<g>` with no transform renders identically).

### Pivot setup

For CSS, resolve `transform-origin` against the SVG viewBox coordinate space:

```css
#arm-near { transform-box: view-box; transform-origin: 218px 194px; }
```

`transform-box: view-box` makes `218px 194px` mean "user unit (218,194) in the viewBox" — i.e. the right shoulder anchor. Without it, the origin resolves against the element's own bounding box and the limb swings from the wrong point.

For SMIL, pass the pivot as the last two numbers of a `rotate` `<animateTransform>`: `from="-6 218 194"`.

---

## Delivery mode: CSS vs SMIL

| | CSS (`<style>` in SVG, or in host page) | SMIL (`<animate>` inside SVG) |
|---|---|---|
| Self-contained `.svg` opened directly | ✅ | ✅ |
| Works in `<img src>` / `background-image` | ✅ (modern browsers) | ✅ |
| Works inline in HTML, host page can control it | ✅ (best) | ✅ |
| `prefers-reduced-motion` support | ✅ native | ⚠️ needs JS/media-query wrapper |
| Easiest to hand-tune | ✅ | ➖ |

**Default to CSS inside a `<style>` block in the SVG** — it's self-contained, readable, and respects reduced-motion. Use SMIL only if the target must animate as a bare `<img>` in an environment that strips `<style>` (rare).

Always gate motion:

```css
@media (prefers-reduced-motion: reduce) {
  #mascot, #arm-near, #eyes, #fx { animation: none; }
}
```

---

## Recipe library

### 1. Idle bob (the default "it's alive" loop)

Whole body drifts up ~4px and back on a slow sine. Pair with a shadow that shrinks slightly as the body rises for weight.

```css
#mascot { animation: bob 3.2s ease-in-out infinite; }
#shadow { animation: shadowPulse 3.2s ease-in-out infinite; transform-box: view-box; transform-origin: 180px 574px; }
@keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes shadowPulse { 0%,100% { transform: scaleX(1); opacity:.25; } 50% { transform: scaleX(.92); opacity:.18; } }
```

### 2. Breathing

Subtle vertical scale on the torso/mascot group. Keep it under 2% or it looks like panting.

```css
#mascot { animation: breathe 4s ease-in-out infinite; transform-box: view-box; transform-origin: 180px 344px; }
@keyframes breathe { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(1.015); } }
```

### 3. Blink

Squash the `#eyes` group to a thin line for ~120ms every few seconds. `transform-origin` at eye height (`y≈107`) so lids close toward the middle. For a stronger blink, put skin-colored eyelid rects inside `#eyes` above the pupils and scale the whole group.

```css
#eyes { transform-box: view-box; transform-origin: 180px 107px; animation: blink 5s infinite; }
@keyframes blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}
```

### 4. Wave (rotate the arm, don't redraw it)

Take the **waving pose** (`02-waving.svg`) — arm already raised — and oscillate `#arm-near` a few degrees around the shoulder. The raised arm rocks side to side like a real wave.

```css
#arm-near { transform-box: view-box; transform-origin: 218px 194px; animation: wave 0.9s ease-in-out infinite; }
@keyframes wave { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
```

To wave from the **neutral** (arm-down) pose instead, animate to a raised angle and hold, e.g. `0% {rotate(0)} 15%,85% {rotate(-95deg)} 100% {rotate(0)}` — but delivering the waving pose file + small oscillation looks better and avoids the arm sweeping across the torso.

### 5. Arm sway (gentle idle, both arms)

```css
#arm-near { transform-box: view-box; transform-origin: 218px 194px; animation: swayR 3.2s ease-in-out infinite; }
#arm-far  { transform-box: view-box; transform-origin: 146px 192px; animation: swayL 3.2s ease-in-out infinite; }
@keyframes swayR { 0%,100%{transform:rotate(0)} 50%{transform:rotate(3deg)} }
@keyframes swayL { 0%,100%{transform:rotate(0)} 50%{transform:rotate(-3deg)} }
```

### 6. Head tilt / nod

```css
#head { transform-box: view-box; transform-origin: 180px 150px; animation: tilt 5s ease-in-out infinite; }
@keyframes tilt { 0%,100%{transform:rotate(0)} 50%{transform:rotate(-2.5deg)} }
```

### 7. Walk cycle (in place)

Use the **walking pose** and alternate leg rotation around the hips plus a two-beat body bob. Legs are single stroked paths — wrap each in a group and rotate around its hip point.

```css
#leg-front { transform-box: view-box; transform-origin: 159px 348px; animation: stepF 0.7s ease-in-out infinite; }
#leg-back  { transform-box: view-box; transform-origin: 201px 348px; animation: stepB 0.7s ease-in-out infinite; }
#mascot    { animation: walkbob 0.35s ease-in-out infinite; }
@keyframes stepF { 0%,100%{transform:rotate(12deg)} 50%{transform:rotate(-12deg)} }
@keyframes stepB { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(12deg)} }
@keyframes walkbob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
```

### 8. FX pulse (sparks / motion arcs)

Fade and scale the accent `#fx` cluster so celebration sparks twinkle.

```css
#fx { transform-box: view-box; transform-origin: 238px 96px; animation: spark 1s ease-in-out infinite; }
@keyframes spark { 0%,100%{opacity:.3; transform:scale(.85)} 50%{opacity:1; transform:scale(1.1)} }
```

---

## Pose-to-pose transitions

To cross-fade between two poses (e.g. neutral → waving on hover), stack both SVGs (or both pose `<g>`s) and toggle opacity — never tween one path into another.

```html
<div class="mascot" style="position:relative">
  <img src="01-neutral.svg" class="pose neutral">
  <img src="02-waving.svg"  class="pose waving">
</div>
<style>
  .mascot .pose { position:absolute; inset:0; transition: opacity .18s ease; }
  .mascot .waving { opacity: 0; }
  .mascot:hover .neutral { opacity: 0; }
  .mascot:hover .waving  { opacity: 1; }
</style>
```

Because every pose shares the exact rig and layer order, the head and torso don't move during the swap — only the arm changes, so the crossfade reads as a single character raising its hand.

---

## SMIL equivalent (for bare-`<img>` targets)

Idle bob + blink, fully self-contained, no CSS:

```svg
<g id="mascot">
  <animateTransform attributeName="transform" type="translate"
    values="0 0; 0 -4; 0 0" dur="3.2s" repeatCount="indefinite"
    calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>
  ...
  <g id="eyes">
    <animateTransform attributeName="transform" type="scale"
      values="1 1; 1 1; 1 0.1; 1 1" keyTimes="0;0.92;0.95;1"
      dur="5s" repeatCount="indefinite" additive="sum"/>
    ...
  </g>
</g>
```

Note SMIL `scale` scales about the origin `(0,0)`, so for blink/rotate you must either translate the group to the pivot first or use the `rotate="cx cy"` form. Prefer CSS unless a bare-`<img>` with stripped `<style>` is the hard requirement.

---

## Validation checklist for animated mascots

- Open the SVG directly in a browser AND embed it as `<img>` — confirm motion runs in both.
- No path `d` value is animated anywhere (grep the file for `attributeName="d"` — there should be none).
- Every rotating group has `transform-box: view-box` (CSS) or an explicit pivot (SMIL). A limb swinging from the page corner means a missing/ wrong origin.
- Amplitudes stay subtle: bob ≤ 6px, breathe ≤ 2%, idle sway ≤ 4°, head tilt ≤ 3°. Big idle motion looks broken.
- `prefers-reduced-motion: reduce` stops all animation.
- The animation reads at 80px tall (the target display size) — tiny blinks/sparks may vanish; scale amplitude up for small display.
