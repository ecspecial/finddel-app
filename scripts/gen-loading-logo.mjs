import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(__dirname, '../assets/loading-logo.svg');
const target = path.join(__dirname, '../src/assets/loadingLogo.ts');

const svg = fs.readFileSync(source, 'utf8').trim();

fs.writeFileSync(target, `export const LOADING_LOGO_XML = ${JSON.stringify(svg)};\n`);
console.log(`Generated ${target}`);
