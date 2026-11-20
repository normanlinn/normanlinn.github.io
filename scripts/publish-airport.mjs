import { cp, rm, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// docs/ is what GitHub Pages serves; dist/ keeps a matching copy. Both are rebuilt from scratch
// so files removed from the site never linger in the published folder.
for (const directory of ['dist', 'docs']) {
  await rm(directory, { recursive: true, force: true });
  await cp('airport/dist', directory, { recursive: true });
  // Tag the stylesheet and script with a content hash so browsers never pair new HTML with old cached files.
  let html = await readFile(`${directory}/index.html`, 'utf8');
  for (const file of ['site.css', 'terminal.js']) {
    const hash = createHash('sha256')
      .update(await readFile(`${directory}/${file}`))
      .digest('hex')
      .slice(0, 10);
    html = html.replace(`"${file}"`, `"${file}?v=${hash}"`);
  }
  await writeFile(`${directory}/index.html`, html);
  await writeFile(
    `${directory}/robots.txt`,
    'User-agent: *\nAllow: /\n\nSitemap: https://normanlinn.github.io/sitemap.xml\n',
  );
  await writeFile(`${directory}/.nojekyll`, '');
}
console.log('Prepared 3D airport portfolio in dist/ and docs/.');
