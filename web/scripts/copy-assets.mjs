// Copies the production-ready images, icon and video from the shared ../assets folder into public/assets.
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../../assets');
const target = resolve(here, '../public/assets');
mkdirSync(target, { recursive: true });
let count = 0;
for (const name of readdirSync(source)) {
  const file = join(source, name);
  if (statSync(file).isDirectory()) continue;
  if (/diptych|unsplash/i.test(name)) continue;
  if (!['.webp', '.svg', '.mp4'].includes(extname(name).toLowerCase())) continue;
  copyFileSync(file, join(target, name));
  count += 1;
}
console.log(`Copied ${count} production assets into public/assets`);
