import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist/assets', { recursive: true });
await build({ entryPoints: ['src/main.ts'], bundle: true, minify: true, format: 'iife', outfile: 'dist/terminal.js', target: 'es2022' });
await copyFile('index.html', 'dist/index.html');
await copyFile('site.css', 'dist/site.css');
for (const name of ['instrument-sans.woff2','instrument-serif-italic.woff2','work-lax-desktop.jpg','work-yaykyaw-desktop.jpg','work-tea-desktop.jpg','work-calc-desktop.jpg','zaw-lin-naing-resume.pdf','zaw-id-upright.webp']) await copyFile('../dist/assets/'+name,'dist/assets/'+name);
console.log('Built airport/dist — standalone static prototype');
