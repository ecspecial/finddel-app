import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, '../assets/loading-logo.svg');
const outPath = path.join(__dirname, '../assets/splash-logo.png');

const svg = fs.readFileSync(svgPath, 'utf8');
const resvg = new Resvg(svg, {
	fitTo: { mode: 'width', value: 542 },
});
const png = resvg.render().asPng();

fs.writeFileSync(outPath, png);
console.log(`Generated ${outPath} (${png.length} bytes)`);
