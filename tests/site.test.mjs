// Checks the built site in docs/ (run `npm run build` first).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const html = readFileSync('docs/index.html', 'utf8');
const CONTACT_EMAIL = 'mrzawlinnaing1001@gmail.com';
const SITE_URL = 'https://normanlinn.github.io/portfolio/';

test('every local file the page links to exists', () => {
  const refs = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)].map(m => m[1])
    .filter(ref => !/^(https?:|mailto:|data:)/.test(ref))
    .map(ref => ref.split('?')[0]);
  assert.ok(refs.length > 5, 'expected local references');
  for (const ref of refs) assert.ok(existsSync(`docs/${ref}`), `missing file: ${ref}`);
});

test('every email link goes to the real address', () => {
  const emails = [...html.matchAll(/mailto:([^"?]+)/g)].map(m => m[1]);
  assert.ok(emails.length > 0, 'expected a contact email link');
  for (const email of emails) assert.equal(email, CONTACT_EMAIL);
});

test('links that open a new tab cannot control this page', () => {
  for (const [tag] of html.matchAll(/<a [^>]*target="_blank"[^>]*>/g)) {
    assert.match(tag, /rel="[^"]*noopener/, `missing rel=noopener: ${tag}`);
  }
});

test('the page sets a content security policy and referrer policy', () => {
  assert.match(html, /http-equiv="Content-Security-Policy" content="[^"]*default-src 'self'/);
  assert.match(html, /name="referrer" content="strict-origin-when-cross-origin"/);
});

test('search and share metadata is complete', () => {
  for (const pattern of [/<title>[^<]+<\/title>/, /name="description" content="[^"]{50,160}"/,
    new RegExp(`rel="canonical" href="${SITE_URL}"`), /property="og:image" content="https:[^"]+social\.jpg"/,
    /name="twitter:card" content="summary_large_image"/]) {
    assert.match(html, pattern);
  }
  assert.ok(existsSync('docs/assets/social.jpg'));
});

test('structured data describes Zaw Lin Naing and every project', () => {
  const block = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  assert.ok(block, 'missing JSON-LD');
  const graph = JSON.parse(block[1])['@graph'];
  const person = graph.find(node => node['@type'] === 'Person');
  assert.equal(person.name, 'Zaw Lin Naing');
  assert.equal(person.email, `mailto:${CONTACT_EMAIL}`);
  const projects = graph.find(node => node['@type'] === 'ItemList').itemListElement.map(item => item.item.url);
  for (const url of projects) assert.ok(html.includes(`href="${url}"`), `project not linked on the page: ${url}`);
});

test('sitemap and llms.txt point at the live site', () => {
  const sitemap = readFileSync('docs/sitemap.xml', 'utf8');
  assert.ok(sitemap.includes(`<loc>${SITE_URL}</loc>`));
  const llms = readFileSync('docs/llms.txt', 'utf8');
  assert.match(llms, /^# Zaw Lin Naing/);
  assert.ok(llms.includes(CONTACT_EMAIL));
});

test('source has no empty catch blocks or leftover console.log', () => {
  for (const file of readdirSync('src')) {
    const code = readFileSync(`src/${file}`, 'utf8');
    assert.doesNotMatch(code, /catch\s*(\([^)]*\))?\s*\{\s*\}/, `empty catch in src/${file}`);
    assert.doesNotMatch(code, /\.catch\(\s*\(\)\s*=>\s*\{\s*\}\s*\)/, `swallowed promise error in src/${file}`);
    assert.doesNotMatch(code, /console\.log\(/, `console.log in src/${file}`);
  }
});
