// Bundle the Vite build into one self-contained HTML body for hosted preview.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const assets = readdirSync(join(dist, 'assets'));
const css = assets.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(dist, 'assets', f), 'utf8')).join('\n');
const js = assets.filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(dist, 'assets', f), 'utf8')).join('\n');
const fontLinks = [...html.matchAll(/<link[^>]+fonts\.(googleapis|gstatic)[^>]*>/g)].map((m) => m[0]).join('\n');
const out = `<title>Tillee Checkup</title>
${fontLinks}
<style>${css}</style>
<div id="root"></div>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>
`;
mkdirSync('artifact', { recursive: true });
writeFileSync('artifact/tillee-checkup.html', out);
console.log('artifact/tillee-checkup.html', (out.length / 1024).toFixed(0) + ' KB');
