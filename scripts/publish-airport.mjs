import { cp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
for (const directory of ['dist', 'docs']) {
  await mkdir(directory, { recursive: true });
  await cp('airport/dist', directory, { recursive: true });
  let html = await readFile(`${directory}/index.html`, 'utf8');
  for (const file of ['site.css', 'terminal.js']) {
    const hash = createHash('sha256').update(await readFile(`${directory}/${file}`)).digest('hex').slice(0, 10);
    html = html.replace(`"${file}"`, `"${file}?v=${hash}"`);
  }
  await writeFile(`${directory}/index.html`, html);
  await writeFile(`${directory}/robots.txt`, 'User-agent: *\nAllow: /\n\nSitemap: https://normanlinn.github.io/sitemap.xml\n');
  await writeFile(`${directory}/.nojekyll`, '');
}
console.log('Prepared 3D airport portfolio in dist/ and docs/.');
