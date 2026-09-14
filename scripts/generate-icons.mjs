// Erzeugt PNG-App-Icons (192, 512, maskable 512) aus der SVG-Vorlage.
// Wird einmalig ausgeführt (npm run gen-icons); Ergebnis liegt unter public/icons.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

// Markenzeichen aus dem Design-System: Teal-Balken + Rot-Balken (siehe App-Header).
const flatSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#161826"/>
  <rect x="188" y="128" width="72" height="256" rx="30" fill="#45b8b4"/>
  <rect x="296" y="128" width="32" height="256" rx="16" fill="#e5495b"/>
</svg>`;

const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#161826"/>
  <rect x="208" y="176" width="56" height="160" rx="24" fill="#45b8b4"/>
  <rect x="288" y="176" width="24" height="160" rx="12" fill="#e5495b"/>
</svg>`;

await sharp(Buffer.from(flatSvg)).resize(192, 192).png().toFile(join(outDir, 'icon-192.png'));
await sharp(Buffer.from(flatSvg)).resize(512, 512).png().toFile(join(outDir, 'icon-512.png'));
await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile(join(outDir, 'icon-maskable-512.png'));

console.log('Icons erzeugt in', outDir);
