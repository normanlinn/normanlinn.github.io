// Build-time pages that load without the 3D terminal: the Quick view (/quick/) and articles
// (/notes/…). build.mjs imports this file with Node's TypeScript support and writes the HTML.
import type { Project } from './projects.ts';
import { caseStudyMarkup } from './case-study.ts';

const SITE = 'https://normanlinn.github.io/';
const EMAIL = 'mrzawlinnaing1001@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/zawlinnaing';
const GITHUB = 'https://github.com/normanlinn';
const external = 'target="_blank" rel="noopener noreferrer"';

export const skills = [
  'TypeScript',
  'JavaScript',
  'React',
  'Next.js',
  'Three.js',
  'HTML & CSS',
  'Framer Motion',
  'Supabase',
  'Cloudflare Workers',
  'Git & GitHub',
  'Figma',
  'Accessibility',
];

type Page = {
  /** Path from the site root, e.g. "quick/". */
  path: string;
  title: string;
  description: string;
  /** Path from this page back to the site root, e.g. "../". */
  root: string;
  body: string;
  jsonLd: object;
};

/** Shared document shell: same fonts, palette and security policy as the 3D terminal. */
export function pageShell(page: Page): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
<meta name="author" content="Zaw Lin Naing">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="theme-color" content="#f3f5f4">
<link rel="canonical" href="${SITE}${page.path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Zaw Lin Naing">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:url" content="${SITE}${page.path}">
<meta property="og:image" content="${SITE}assets/social-terminal.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${page.root}assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${page.root}quick/quick.css">
<script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, '\\u003c')}</script>
<script src="${page.root}quick/quick.js" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="quick-top">
  <a class="quick-brand" href="${page.root}quick/"><img src="${page.root}assets/zln-mark.svg" alt="" width="28" height="28"> Zaw Lin Naing</a>
  <nav aria-label="Pages"><a href="${page.root}quick/#work">Work</a><a href="${page.root}notes/laxcommute/">Writing</a><a href="${page.root}quick/#contact">Contact</a><a class="quick-3d" href="${page.root}">3D terminal ↗</a></nav>
</header>
<main id="main">
${page.body}
</main>
<footer class="quick-footer"><p>© 2026 Zaw Lin Naing · <a href="${page.root}">Explore the 3D terminal</a> · <a href="${GITHUB}" ${external}>GitHub</a></p></footer>
</body>
</html>
`;
}

function personJsonLd(projects: Project[]) {
  return {
    '@type': 'Person',
    '@id': SITE + '#person',
    name: 'Zaw Lin Naing',
    alternateName: 'Norman Linn',
    jobTitle: 'Software developer',
    url: SITE,
    email: 'mailto:' + EMAIL,
    homeLocation: { '@type': 'Place', name: 'Los Angeles, California' },
    affiliation: { '@type': 'CollegeOrUniversity', name: 'El Camino College' },
    knowsAbout: skills,
    sameAs: [GITHUB, LINKEDIN],
    workExample: projects.map(p => ({
      '@type': 'CreativeWork',
      name: p.name,
      url: p.url,
      description: p.summary,
    })),
  };
}

export function renderQuickView(projects: Project[]): string {
  const body = `
<section class="quick-hero" aria-labelledby="intro">
  <p class="quick-eyebrow">Software developer · Los Angeles</p>
  <h1 id="intro">Zaw Lin Naing</h1>
  <p class="quick-lead">I build practical web apps with TypeScript, from a live shuttle tracker for LAX employees to a multiplayer 3D night fair. Before writing code I worked in aviation customer service at LAX, and I study at El Camino College.</p>
  <p class="quick-open"><span aria-hidden="true"></span>Open to remote or part-time web development work.</p>
  <div class="quick-actions">
    <a class="button primary" href="mailto:${EMAIL}">Email me</a>
    <a class="button secondary" href="../assets/zaw-lin-naing-resume.pdf" target="_blank" rel="noopener">Résumé (PDF)</a>
    <a class="button secondary" href="${GITHUB}" ${external}>GitHub</a>
    <a class="button secondary" href="${LINKEDIN}" ${external}>LinkedIn</a>
  </div>
</section>

<section class="quick-work" id="work" aria-labelledby="work-title">
  <h2 id="work-title">Selected work</h2>
  <ol class="quick-index">${projects.map(p => `<li><a href="#case-${p.id}"><span>${p.gate}</span>${p.name}</a></li>`).join('')}</ol>
  ${projects.map(p => caseStudyMarkup(p, '../assets/', 3)).join('\n')}
</section>

<section class="quick-columns" aria-label="About, skills and writing">
  <div>
    <h2>About</h2>
    <p>Airport work is full of changing plans and people who need a clear next step. That shapes how I build: notice the friction, keep the important things obvious, and keep improving. LAXCommute started from my own commute between an employee lot and the terminals.</p>
  </div>
  <div>
    <h2>Toolkit</h2>
    <ul class="case-stack">${skills.map(s => `<li>${s}</li>`).join('')}</ul>
  </div>
  <div>
    <h2>Writing</h2>
    <p><a class="quick-link" href="../notes/laxcommute/">How I built a live LAX shuttle tracker →</a></p>
  </div>
</section>

<section class="quick-contact" id="contact" aria-labelledby="contact-title">
  <h2 id="contact-title">Let’s talk</h2>
  <p>The quickest way to reach me is email.</p>
  <p class="quick-email"><a href="mailto:${EMAIL}">${EMAIL}</a></p>
</section>`;
  return pageShell({
    path: 'quick/',
    title: 'Zaw Lin Naing · Software developer · Quick view',
    description:
      'Zaw Lin Naing, a software developer in Los Angeles: case studies for LAXCommute, Yay Kyaw Nights, Burman Tea and Derivatives Field Guide, plus résumé and contact.',
    root: '../',
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        personJsonLd(projects),
        {
          '@type': 'ProfilePage',
          url: SITE + 'quick/',
          name: 'Zaw Lin Naing · Quick view',
          mainEntity: { '@id': SITE + '#person' },
        },
      ],
    },
  });
}
