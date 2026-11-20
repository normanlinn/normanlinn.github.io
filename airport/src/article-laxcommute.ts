// "How I built a live LAX shuttle tracker". Technical details come from the LAXCommute repository
// and its docs (README, HOSTING, PWA, LANGUAGE, SECURITY, BACKEND).
import { pageShell } from './quick-view.ts';

const SITE = 'https://normanlinn.github.io/';
const external = 'target="_blank" rel="noopener noreferrer"';

export function renderLaxArticle(): string {
  const body = `
<article class="article">
  <p class="quick-eyebrow">Notes · LAXCommute</p>
  <h1>How I built a live LAX shuttle tracker</h1>
  <p class="article-meta">By Zaw Lin Naing · November 2026 · 3 minute read</p>

  <p>LAX employees park in the South, East and West lots and ride a shuttle to the terminals. When I worked at the airport, the hard part of that commute was the wait: standing at a stop without knowing where the bus was. The positions already existed in LAX’s shuttle tracker. I wanted them on a phone, one tap from my usual stop, in the languages my coworkers speak.</p>

  <figure>
    <video class="project-preview case-clip" src="../../assets/clip-lax.mp4" poster="../../assets/work-lax-desktop.jpg" width="1440" height="900" muted loop playsinline preload="none" aria-label="LAXCommute switching between the East, West and South lot routes"></video>
    <figcaption>LAXCommute switching between the East, West and South lot routes.</figcaption>
  </figure>

  <h2>A small server, because a static site was not enough</h2>
  <p>The app is React and TypeScript, built with Vite. My first instinct was to host it for free on GitHub Pages, but a static host cannot call the shuttle feed for you. So Cloudflare Workers serves both the app and a small API on the same origin. That gateway is deliberately narrow: it only answers <code>GET</code> requests for the three employee routes, checks that every stop belongs to the route being asked about, rejects duplicate or unknown parameters, and only ever talks to one fixed upstream host. A public endpoint that does exactly one thing is much easier to trust.</p>

  <h2>Built for a phone at a parking lot</h2>
  <p>LAXCommute installs as a progressive web app. Its service worker tries the network first for routes and live positions and falls back to saved data after eight seconds, so a weak signal never leaves you with a blank screen. Route shapes are kept for up to 30 days. When the app shows saved rather than live data, it says so plainly, because a confident-looking but stale arrival time is worse than none.</p>
  <p>The map uses Leaflet with OpenFreeMap tiles, so it needs no API key. Buses glide between the GPS positions the feed reports; the app never invents movement between updates. Visitors who prefer reduced motion see positions update without animation.</p>

  <h2>Three languages, with the signs left alone</h2>
  <p>The whole interface switches between English, Spanish and Burmese without losing your selected route, stop or saved commute. One decision mattered more than I expected: stop names, lot names, terminals and bus numbers stay exactly as the feed and the physical signs show them. Translating “South Lot Stop #1” would make the app harder to match with what you see in front of you.</p>

  <h2>The bug I’m proudest of fixing</h2>
  <p>You can save your usual commute as a guest on the device, or with an account stored in Supabase. Accounts introduced a subtle problem: requests can finish out of order. A slow response from an older load could arrive after a newer save and quietly overwrite it, and signing out in the middle of a load could briefly show the previous account’s settings.</p>
  <p>The fix was to treat every load and save as belonging to a specific moment and a specific account, and to ignore any response that no longer matches. Then I wrote tests for each case: a failed save, signing out during a load, and a save that supersedes an older load. On the database side, row-level security policies let each account read and change only its own row, and I verified that with real role tests, including blocked cross-account reads.</p>

  <h2>Keeping it honest</h2>
  <ul>
    <li><strong>192 automated tests</strong> across 37 files run before every release, alongside a formatting check and a production build.</li>
    <li>The build refuses to ship if a secret key ends up in a browser-visible variable.</li>
    <li>A content security policy limits which scripts, connections and frames the app can load.</li>
    <li>The app is labelled as an independent project, not an official LAWA or airline service, and it never promises that a nearby bus means a seat.</li>
  </ul>

  <h2>What I learned</h2>
  <p>The interesting problems were not the map or the animations. They were the edges: a weak signal, a slow response arriving late, a label that has to match a real sign. Building something I needed myself made those edges impossible to ignore.</p>

  <div class="panel-links">
    <a class="button primary" href="https://employeeshuttlelax.com/" ${external}>Open LAXCommute ↗</a>
    <a class="button secondary" href="https://github.com/normanlinn/LAXCommute" ${external}>View the source</a>
    <a class="button secondary" href="../../quick/">More of my work</a>
  </div>
</article>`;
  return pageShell({
    path: 'notes/laxcommute/',
    title: 'How I built a live LAX shuttle tracker · Zaw Lin Naing',
    description:
      'How Zaw Lin Naing built LAXCommute, a free installable app for LAX employee shuttle arrivals: a narrow Cloudflare gateway, offline-friendly PWA, three languages and race-condition fixes.',
    root: '../../',
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'How I built a live LAX shuttle tracker',
      author: { '@type': 'Person', name: 'Zaw Lin Naing', url: SITE },
      datePublished: '2026-11-20',
      mainEntityOfPage: SITE + 'notes/laxcommute/',
      about: { '@type': 'SoftwareApplication', name: 'LAXCommute', url: 'https://employeeshuttlelax.com/' },
    },
  });
}
