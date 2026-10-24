# Tillee mascot: poses, animation and motion frames

Generated from `src/brand/mascot/rig.ts` with the svg-mascot-creator skill
(`.claude/skills/svg-mascot-creator`). Don't edit these files by hand. Change the rig, then run:

```bash
npx vite-node scripts/build-mascot.ts
```

## What's here

| Path | What it is |
|---|---|
| `poses/NN-<pose>.svg` | 8 static poses, flat color, about 2.5 KB each, no dependencies |
| `animated/<motion>.svg` | Self-animating SVGs (CSS inside, looped for review, stopped by `prefers-reduced-motion`) |
| `frames/<motion>/<motion>-NN.svg` | Each motion baked into frames at 12 fps, to import into After Effects, Figma, Rive or a Lottie pipeline |
| `frames/frames.json` | Timing spec for each motion: duration, loop, frame list, and every track's group, pivot and keyframes |
| `preview-poses.png`, `preview-frames.png` | Contact sheets |

## Rig

- **Canvas:** viewBox `-12 0 264 240`. The body is centred at (120,120) with r 72, and the ground shadow sits at y 218.
- **Anchors:** shoulders (56,128) and (184,128); hips (102,180) and (138,180); neck pivot (120,186); eyes (120,106).
- **Groups:** `#shadow`, then `#mascot` containing `#leg-back`, `#leg-front`, `#arm-far`, the body, `#head` (glasses, `#eyes`, brows, mouth, bow tie), `#arm-near` and `#fx`.
- **Limbs:** double-stroked polylines (outline 17, fill 12, round caps) ending in a hand circle.
- **Palette:** body #7A52E6 · shade #5A36C4 · outline #3F2596 · hand #8C68EE · rim #2A2340 · lens #FFFFFF · accent #E0303A (bow tie and every FX mark).

## Motions

| Motion | Pose | Duration | Loop | Used for |
|---|---|---|---|---|
| idle | neutral | 3200 ms | yes | Resting placements (bob, shadow pulse, arm sway) |
| blink | neutral | 5000 ms | yes | Layered on any open-eyed pose |
| wave | waving | 900 ms | yes (2× in app) | Welcome |
| think | thinking | 2400 ms | yes | Processing while real work runs |
| explain | pointing | 1600 ms | no | "Why we ask" |
| reassure | reassuring | 1400 ms | no | Saved / result (one nod) |
| celebrate | celebrating | 800 ms | no | Section break (anticipation squash, hop, land) |
| support | supportive | 2000 ms | no | Upload or save failure |
| walk | walking | 700 ms | yes | Source for entrances and empty states |

Easing is ease-in-out between keys, and the baked frames use the same curve. Motion moves groups around their anchors only; path data is never animated. Idle loops stay subtle (bob ≤ 6px, sway ≤ 8°).
