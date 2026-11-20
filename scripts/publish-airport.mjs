import { cp, rm, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

// docs/ is what GitHub Pages serves; dist/ keeps a matching copy. Both are rebuilt from scratch
// so files removed from the site never linger in the published folder.
const hashOf = async path =>
  createHash('sha256')
    .update(await readFile(path))
    .digest('hex')
    .slice(0, 10);

// Each page, and the files it links to (relative to the page) that get a content hash, so browsers
// never pair new HTML with an old cached stylesheet or script.
const pages = [
  { html: 'index.html', files: ['site.css', 'terminal.js'] },
  {
    html: 'quick/index.html',
    files: ['../quick/quick.css', '../quick/quick.js'],
  },
  {
    html: 'notes/laxcommute/index.html',
    files: ['../../quick/quick.css', '../../quick/quick.js'],
  },
];

for (const directory of ['dist', 'docs']) {
  await rm(directory, { recursive: true, force: true });
  await cp('airport/dist', directory, { recursive: true });
  for (const page of pages) {
    const htmlPath = `${directory}/${page.html}`;
    const base = htmlPath.slice(0, htmlPath.lastIndexOf('/') + 1);
    let html = await readFile(htmlPath, 'utf8');
    for (const file of page.files) {
      const hash = await hashOf(join(base, file));
      html = html.replace(`"${file}"`, `"${file}?v=${hash}"`);
    }
    await writeFile(htmlPath, html);
  }
  await writeFile(
    `${directory}/robots.txt`,
    'User-agent: *\nAllow: /\n\nSitemap: https://normanlinn.github.io/sitemap.xml\n',
  );
  await writeFile(`${directory}/.nojekyll`, '');
}
console.log('Prepared 3D airport portfolio, quick view and notes in dist/ and docs/.');
