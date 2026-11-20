import { build } from 'esbuild';
import { mkdir, copyFile, cp, rm } from 'node:fs/promises';

// Everything the site needs comes from this folder: src/, index.html, site.css, assets/ and public/
// (files served from the site root, such as llms.txt and sitemap.xml).
await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: true,
  format: 'iife',
  outfile: 'dist/terminal.js',
  target: 'es2022',
});
await copyFile('index.html', 'dist/index.html');
await copyFile('site.css', 'dist/site.css');
await cp('assets', 'dist/assets', { recursive: true });
await cp('public', 'dist', { recursive: true });
console.log('Built airport/dist');
