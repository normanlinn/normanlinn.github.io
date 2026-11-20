import { build } from 'esbuild';
import { mkdir, copyFile, cp, rm, readFile, writeFile } from 'node:fs/promises';
// Node runs these TypeScript modules directly (type stripping), so the 3D panels and the static
// pages share one copy of the project content.
import { projects } from './src/projects.ts';
import { renderQuickView } from './src/quick-view.ts';
import { renderLaxArticle } from './src/article-laxcommute.ts';

// Everything the site needs comes from this folder: src/, index.html, the stylesheets, assets/ and
// public/ (files served from the site root, such as llms.txt and sitemap.xml).
await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
await mkdir('dist/quick', { recursive: true });
await mkdir('dist/notes/laxcommute', { recursive: true });

const bundle = { bundle: true, minify: true, format: 'iife', target: 'es2022' };
await build({ ...bundle, entryPoints: ['src/main.ts'], outfile: 'dist/terminal.js' });
await build({ ...bundle, entryPoints: ['src/quick.ts'], outfile: 'dist/quick/quick.js' });

const caseStudyCss = await readFile('case-study.css', 'utf8');
await writeFile('dist/site.css', (await readFile('site.css', 'utf8')) + '\n' + caseStudyCss);
await writeFile('dist/quick/quick.css', (await readFile('quick.css', 'utf8')) + '\n' + caseStudyCss);

await copyFile('index.html', 'dist/index.html');
await writeFile('dist/quick/index.html', renderQuickView(projects));
await writeFile('dist/notes/laxcommute/index.html', renderLaxArticle());
await cp('assets', 'dist/assets', { recursive: true });
await cp('public', 'dist', { recursive: true });
console.log('Built airport/dist (terminal, quick view and notes)');
