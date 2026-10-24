/**
 * Export the mascot rig to files (run: npx vite-node scripts/build-mascot.ts).
 *
 *   assets/mascot/poses/NN-<pose>.svg        static poses (skill naming)
 *   assets/mascot/animated/<motion>.svg      self-contained CSS-animated SVGs
 *   assets/mascot/frames/<motion>/NN.svg     baked motion frames at FPS
 *   assets/mascot/frames/frames.json         timing spec for motion designers
 *   assets/mascot/preview-*.png              contact sheets (Playwright render)
 */
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  MOTIONS,
  POSES,
  REDUCED_MOTION_CSS,
  buildMascotSvg,
  keyToSvgTransform,
  motionCss,
  sampleTrack,
  type GroupName,
  type PoseName,
} from '../src/brand/mascot/rig';

const OUT = 'assets/mascot';
const FPS = 12;
const ORDER: PoseName[] = ['neutral', 'waving', 'pointing', 'thinking', 'reassuring', 'celebrating', 'supportive', 'walking'];

rmSync(OUT, { recursive: true, force: true });
for (const d of ['poses', 'animated', 'frames']) mkdirSync(join(OUT, d), { recursive: true });

// 1. Static poses
ORDER.forEach((p, i) => {
  writeFileSync(join(OUT, 'poses', `${String(i + 1).padStart(2, '0')}-${p}.svg`), buildMascotSvg(p, { title: `Tillee mascot, ${p}` }) + '\n');
});

// 2. Animated SVGs (CSS in a <style> block, reduced-motion gated)
const blink = MOTIONS.find((m) => m.name === 'blink')!;
for (const m of MOTIONS) {
  if (m.name === 'blink') continue;
  const withBlink = m.pose !== 'reassuring' ? motionCss(blink, 'id') : '';
  // Files always loop (even one-shot beats) so the motion is reviewable on its own.
  const css = `${motionCss(m, 'id', '', 'infinite')}\n${withBlink}\n${REDUCED_MOTION_CSS('id')}`;
  writeFileSync(join(OUT, 'animated', `${m.name}.svg`), buildMascotSvg(m.pose, { style: `<style>${css}</style>`, title: `Tillee mascot, ${m.name}` }) + '\n');
}

// 3. Baked frames + timing spec
type FrameSpec = { motion: string; pose: string; fps: number; durationMs: number; loop: boolean; use: string; frames: string[]; tracks: unknown };
const spec: FrameSpec[] = [];
for (const m of MOTIONS) {
  const n = Math.max(2, Math.round((m.durationMs / 1000) * FPS));
  const dir = join(OUT, 'frames', m.name);
  mkdirSync(dir, { recursive: true });
  const files: string[] = [];
  for (let f = 0; f < n; f++) {
    const t = m.loop ? f / n : f / (n - 1);
    const transforms: Partial<Record<GroupName, { transform?: string; opacity?: number }>> = {};
    for (const tr of m.tracks) {
      const k = sampleTrack(tr, t);
      transforms[tr.group] = { transform: keyToSvgTransform(k, tr.pivot), opacity: k.opacity === undefined ? undefined : +k.opacity.toFixed(3) };
    }
    const name = `${m.name}-${String(f + 1).padStart(2, '0')}.svg`;
    writeFileSync(join(dir, name), buildMascotSvg(m.pose, { transforms }) + '\n');
    files.push(`${m.name}/${name}`);
  }
  spec.push({ motion: m.name, pose: m.pose, fps: FPS, durationMs: m.durationMs, loop: m.loop, use: m.use, frames: files, tracks: m.tracks });
}
writeFileSync(join(OUT, 'frames', 'frames.json'), JSON.stringify(spec, null, 2) + '\n');

// 4. Contact sheets
const sheet = (title: string, cells: Array<{ label: string; svg: string }>, cols: number) => `<!doctype html><html><head><meta charset="utf-8">
<style>body{margin:0;padding:24px;background:#fff9f2;font:600 13px/1.3 Inter,system-ui,sans-serif;color:#2a2340}
h1{font-size:18px;margin:0 0 16px}.g{display:grid;grid-template-columns:repeat(${cols},1fr);gap:12px}
.c{background:#fff;border:1px solid #ebe4ef;border-radius:12px;padding:8px;text-align:center}.c svg{width:100%;height:auto;display:block}</style></head>
<body><h1>${title}</h1><div class="g">${cells.map((c) => `<div class="c">${c.svg}<div>${c.label}</div></div>`).join('')}</div></body></html>`;

const poseCells = ORDER.map((p, i) => ({ label: `${String(i + 1).padStart(2, '0')} ${p}`, svg: buildMascotSvg(p) }));
writeFileSync(join(OUT, 'preview-poses.html'), sheet('Tillee mascot · poses', poseCells, 4));
const frameRows = MOTIONS.filter((m) => m.name !== 'blink').flatMap((m) => {
  const s = spec.find((x) => x.motion === m.name)!;
  return s.frames.map((f, i) => ({ label: `${m.name} ${i + 1}/${s.frames.length}`, svg: readFileSync(join(OUT, 'frames', f), 'utf8') }));
});
writeFileSync(join(OUT, 'preview-frames.html'), sheet(`Tillee mascot · motion frames @ ${FPS} fps`, frameRows, 10));

// Playwright is resolved from the environment (preinstalled), not a project dependency.
const { createRequire } = await import('node:module');
const { chromium } = createRequire(join(process.env.PLAYWRIGHT_ROOT ?? '/opt/node-tools', 'noop.js'))('playwright');
const browser = await chromium.launch();
for (const [html, png, width] of [
  ['preview-poses.html', 'preview-poses.png', 960],
  ['preview-frames.html', 'preview-frames.png', 1400],
] as const) {
  const page = await browser.newPage({ viewport: { width, height: 600 }, deviceScaleFactor: 2 });
  await page.goto('file://' + join(process.cwd(), OUT, html));
  await page.screenshot({ path: join(OUT, png), fullPage: true });
  await page.close();
}
await browser.close();

const total = spec.reduce((n, s) => n + s.frames.length, 0);
console.log(`poses: ${ORDER.length}, animated: ${MOTIONS.length - 1}, frames: ${total} across ${spec.length} motions`);
