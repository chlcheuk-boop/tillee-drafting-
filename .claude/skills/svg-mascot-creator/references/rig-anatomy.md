# Rig Anatomy Reference

Layer-by-layer breakdown of the canonical mascot (`example-poses/`). Use it as the blueprint when building a NEW character: keep the structure, swap the identity (colors, outfit, props, head style).

## Canvas & anchors

- viewBox: `0 0 360 620` — character centered at x=180
- Ground line: feet at y≈570, shadow ellipse center (180, 574) rx=72 ry=11 fill #000 opacity 0.25
- Left shoulder anchor: (146, 192) · Right shoulder anchor: (218, 194)
- Hip block: rect (138, 338, 84×26, rx 6)
- Head circle-ish path spans roughly x 137–223, y 31–152

## Canonical palette (reference character)

| Role | Hex |
|---|---|
| skin | #C98A5E |
| skin-dark (cap of neck, nose) | #AE7048 |
| hair | #2B241F |
| hair highlight strokes | #3F362E |
| ink (eyes, glasses, brows) | #2A241E |
| mouth line | #7A4A34 |
| hoodie body | #EDE6DA |
| hoodie shade (right side, 0.55 op) | #DCD2C1 |
| sleeve fill | #E2D9C9 |
| sleeve outline | #C9BCA5 |
| shorts/hem | #E4DCCE |
| accent (drawstrings, FX, code lines) | #E8490F |
| badge card | #F5F1E8 |
| badge text lines | #B9B2A4 |
| pants/legs | #3B4048 |
| shoe upper | #F2EFE8 |
| shoe sole | #C9C3B6 |
| laptop shell | #2E3138 · screen #3E4550 · base bar #4A505C · gray code #9AA3AE |

For a new character, map each ROLE to new hexes; keep the role list.

## Layer order (exact, back → front)

1. Ground shadow ellipse
2. Hip block rect
3. Two legs — single paths, stroke #3B4048 width 34, round caps: `M159,348 L158,552` and `M201,348 L202,552`
4. Two shoes — reusable `<g transform="translate(x,y) rotate(a) scale(±1,1)">` containing two paths (upper + sole). The `scale(-1,1)` mirrors the left shoe.
5. Torso — one rounded path (x 132–228, y 172–344), fill hoodie
6. Torso shade — narrower path hugging the right edge, fill hoodie-shade, opacity 0.55
7. Hem strip rect + collar path
8. Drawstrings — accent-colored strokes width 5: collar arc + two lines down to a small toggle rect
9. ID badge — white-ish rect 28×34 with a small skin-tone photo rect and 3 gray text-line rects
10. **Far (left) arm** — see limb technique below — then hand circle
11. **Held prop** (laptop): base bar rect → shell rect → screen rect → 5 code-line rects alternating accent/gray
12. **Near (right) arm** + hand circle
13. Hood-back trapezoid behind neck (`M154,298 …` area) with two seam strokes
14. Neck rect (22×38 skin) with skin-dark cap rect
15. Ears — two ellipses rx7 ry9 at (137,110) and (223,110)
16. Face — big rounded path fill skin
17. Hair — one filled path over the top/sides + 2 highlight strokes width 4
18. Eyebrows — two rotated rects (rotate ∓4°)
19. Mouth (see expressions) + nose (tiny curved path fill skin-dark)
20. Eyes — two pupil circles r 3.6 ink
21. Glasses — two circles r 16, `fill #FFF fill-opacity 0.07`, stroke ink 2.6 + bridge arc + two temple-arm strokes to the ears

## Limb technique (the core trick)

Every arm = same polyline stroked twice, then a hand:

```svg
<path d="M218,196 L246,158 L258,116" fill="none" stroke="#C9BCA5" stroke-width="29" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M218,196 L246,158 L258,116" fill="none" stroke="#E2D9C9" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="261" cy="106" r="10.5" fill="#C98A5E"/>
```

- First point = shoulder anchor (never changes)
- Second point = elbow, third = wrist
- Hand circle sits ~10 px beyond the wrist along the forearm direction
- Outline stroke − fill stroke = 5 → a crisp ~2.5 px outline all around

## Pose recipes (only these lines differ from neutral)

**Neutral (01)** — L arm: `M146,192 L140,244 L108,250`, hand (99,247). R arm: `M218,194 L232,250 L206,300`, hand (202,306). Laptop under left hand. Closed-smile mouth.

**Waving (02)** — R arm raised: `M218,196 L246,158 L258,116`, hand (261,106) r 11. FX: two accent motion arcs right of the hand, widths 3.5, opacities 0.9 / 0.55.

**Pointing (03)** — Laptop removed. L arm drops straight: `M142,196 L132,252 L131,304`, hand (131,313). R arm extends up-right: `M218,196 L248,172 L274,144`; instead of a circle, the hand is a `<g translate(274,144) rotate(-40)>` with a palm circle r 9.5 + index-finger rect 27×8.5 + thumb rect 9×15 (all skin fill).

**Arms crossed (04)** — Laptop removed. Each arm is TWO segments: upper arm `M142,194 L138,238` then forearm crossing the chest `M138,240 L212,256` (and mirrored `M218,194 L222,238`, `M224,240 L150,264`). Hands tucked at (216,258) r 9 and (146,266) r 10.5. Draw left set first, right set on top.

**Walking (05)** — Legs bend: `M156,348 L134,452 L128,554` and `M204,348 L224,444 L234,538`. Back shoe: `translate(238,562) rotate(14)`. Front shoe at (128,570). Shadow widens to rx 95, cx 185. Arms swing gently: `M142,194 L128,240 L126,286` / `M218,194 L236,242 L244,286`.

**Celebrating (06)** — R arm punches up: `M218,196 L234,140 L238,96`, hand (239,86) r 11.5. FX above fist: three accent stroke rays width 4 + two accent dots r 3. Mouth swaps to open-laugh: dark mouth path `M168,132 Q180,135 192,132 Q190,146 180,147 Q170,146 168,132 Z` fill #5E3325 with white teeth path on top.

## Expression swaps

- Closed smile: `M171,133 Q180,141 189,133` stroke mouth-color 2.6 round
- Open laugh: filled mouth + teeth (see celebrating)
- Others to invent as needed: flat worried line, small "o" surprise circle, wink = replace one pupil with a short curved stroke

## Inventing new poses

1. Copy `01-neutral.svg`
2. Change ONLY arm/leg paths, hand positions, expression, FX, prop position
3. Keep shoulder/hip anchors; move elbows/wrists
4. Sanity: elbow-to-wrist and shoulder-to-elbow segment lengths should stay within ±15% of neutral (≈55–60 px each) or the limb will look stretched
5. Add at most one FX cluster in the accent color
6. Render and diff against neutral before delivering
