// Erzeugt PNG-App-Icons (192, 512, maskable 512) aus der SVG-Vorlage.
// Wird einmalig ausgeführt (npm run gen-icons); Ergebnis liegt unter public/icons.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const flatSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0f172a"/>
  <g stroke="#38bdf8" stroke-width="34" stroke-linecap="round" fill="none">
    <line x1="80" y1="256" x2="432" y2="256"/>
    <line x1="128" y1="176" x2="128" y2="336"/>
    <line x1="176" y1="136" x2="176" y2="376"/>
    <line x1="336" y1="136" x2="336" y2="376"/>
    <line x1="384" y1="176" x2="384" y2="336"/>
  </g>
</svg>`;

const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0f172a"/>
  <g stroke="#38bdf8" stroke-width="26" stroke-linecap="round" fill="none">
    <line x1="146" y1="256" x2="366" y2="256"/>
    <line x1="180" y1="196" x2="180" y2="316"/>
    <line x1="214" y1="166" x2="214" y2="346"/>
    <line x1="298" y1="166" x2="298" y2="346"/>
    <line x1="332" y1="196" x2="332" y2="316"/>
  </g>
</svg>`;

await sharp(Buffer.from(flatSvg)).resize(192, 192).png().toFile(join(outDir, 'icon-192.png'));
await sharp(Buffer.from(flatSvg)).resize(512, 512).png().toFile(join(outDir, 'icon-512.png'));
await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile(join(outDir, 'icon-maskable-512.png'));

console.log('Icons erzeugt in', outDir);
