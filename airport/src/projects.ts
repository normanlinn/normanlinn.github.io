// One source for project content: the 3D gate panels (main.ts) and the Quick view page
// (quick-view.ts, rendered at build time) both read from here. Facts come from each project's
// repository and docs; keep them that way rather than adding claims that cannot be checked.

export type ProjectId = 'lax' | 'yay' | 'tea' | 'calc';

export type Project = {
  id: ProjectId;
  gate: string;
  name: string;
  kind: string;
  /** One sentence shown under the title. */
  summary: string;
  problem: string;
  built: string;
  /** The hardest part, and how it was solved. */
  hardest: string;
  /** Short, checkable facts. */
  results: string[];
  stack: string[];
  image: string;
  /** Short silent loop recorded from the live site (assets/). */
  clip?: string;
  url: string;
  source?: string;
};

export const projects: Project[] = [
  {
    id: 'lax',
    gate: 'E42',
    name: 'LAXCommute',
    kind: 'Web app · PWA',
    summary: 'A free, installable app for checking LAX employee shuttle arrivals.',
    problem:
      'Getting from an employee parking lot to a terminal at LAX means waiting for a shuttle you cannot see. I worked at LAX, so I wanted live arrivals on my phone, in the languages my coworkers speak.',
    built:
      'A phone-first React and TypeScript app with live bus positions and arrival predictions for the South, East and West lots, a saved commute, and directions in Apple or Google Maps, in English, Spanish and Burmese. It installs as a PWA and a Cloudflare Worker serves the shuttle feed from the same origin as the app.',
    hardest:
      'Saving a commute safely. A slow network response must never overwrite a newer save, and signing out mid-load must never show another account’s settings. I covered those races with tests and verified the database rules so one account can never read or change another’s row.',
    results: [
      '192 automated tests across 37 files',
      'English, Spanish and Burmese',
      'Works offline, with saved data clearly labelled',
      '104 commits since September 2026',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Leaflet', 'MapLibre', 'Supabase', 'Cloudflare Workers'],
    image: 'work-lax-desktop.jpg',
    clip: 'clip-lax.mp4',
    url: 'https://employeeshuttlelax.com/',
    source: 'https://github.com/normanlinn/LAXCommute',
  },
  {
    id: 'yay',
    gate: 'E43',
    name: 'Yay Kyaw Nights',
    kind: '3D browser game · Multiplayer',
    summary: 'A walkable 3D night fair inspired by Yangon’s Yay Kyaw.',
    problem:
      'Yangon’s night fairs are lanterns, snack carts, rides and crowds of families. I wanted to put that feeling in a browser, so anyone can walk through it from anywhere.',
    built:
      'A Three.js world with fourteen zones and first-person rides, a character creator with Myanmar outfits, a crowd that speaks Burmese, and music and fireworks synthesised with the Web Audio API. Thadingyut wishes are shared through a small Vercel API backed by Upstash Redis.',
    hardest:
      'Multiplayer without a game server. Players connect browser to browser over WebRTC with PeerJS. One player relays positions and chat for the fair, and if they leave, another takes over within a few seconds.',
    results: [
      '14 zones, with rides from the Ferris wheel to a mini train',
      'Up to 12 players share a public fair',
      'Every sound is synthesised: no audio files',
    ],
    stack: ['TypeScript', 'Three.js', 'WebRTC (PeerJS)', 'Web Audio API', 'Upstash Redis', 'Vercel'],
    image: 'work-yaykyaw-desktop.jpg',
    clip: 'clip-yay.mp4',
    url: 'https://yaykyawfair.vercel.app/',
    source: 'https://github.com/normanlinn/yaykyawfair',
  },
  {
    id: 'tea',
    gate: 'E44',
    name: 'Burman Tea',
    kind: 'Shop website · Ordering and staff tools',
    summary: 'A storefront and staff workspace for a Burmese tea shop in Westwood, Los Angeles.',
    problem:
      'A Burmese milk tea and matcha shop needed a website that works for customers and for the people behind the counter, in English and Burmese.',
    built:
      'A mobile-first Next.js storefront with the menu, pickup hours, directions and a bag-and-checkout flow, plus a staff workspace where the owner manages orders, the menu, photos, promotions and staff roles.',
    hardest:
      'Trust. Prices are calculated on the server from the current menu, so nobody can change a price in the browser, and every staff request is checked against that person’s role on the server, backed by row-level security in the database.',
    results: [
      'Owner, manager and staff roles, checked on the server',
      'English and Burmese',
      'Card payments built and ready to switch on',
    ],
    stack: ['Next.js', 'TypeScript', 'React', 'Supabase', 'Stripe', 'Framer Motion'],
    image: 'work-tea-desktop.jpg',
    clip: 'clip-tea.mp4',
    url: 'https://burmantea.vercel.app/',
  },
  {
    id: 'calc',
    gate: 'E45',
    name: 'Derivatives Field Guide',
    kind: 'Learning tool · Next.js',
    summary: 'An interactive calculus study site that grew with my Math 190 class.',
    problem:
      'Math 190 moves fast: derivative rules, curve sketching, optimisation and integrals in one semester. I wanted one place to see why each rule works, and to practise before every quiz.',
    built:
      'A static Next.js site that grew with the course. Each textbook section has the idea, a graph you can drag, worked examples and practice with hints and full solutions, alongside practice quizzes, a practice final and a cheat sheet. Math is rendered at build time with KaTeX, and optional sign-in syncs progress across devices.',
    hardest:
      'Making the math work on a phone: keeping wide equations from pushing the page sideways, and making the canvas graphs follow a finger as well as a mouse while staying sharp on high-density screens.',
    results: [
      '23 textbook sections, from §2.8 to §5.5',
      'Practice quizzes for Quizzes 3–5 and a practice final',
      'Progress syncs across devices with optional sign-in',
    ],
    stack: ['Next.js', 'TypeScript', 'React', 'KaTeX', 'Motion', 'Firebase'],
    image: 'work-calc-desktop.jpg',
    clip: 'clip-calc.mp4',
    url: 'https://normanlinn.github.io/calculus-study-site/',
    source: 'https://github.com/normanlinn/calculus-study-site',
  },
];

export const projectById = Object.fromEntries(projects.map(project => [project.id, project])) as Record<
  ProjectId,
  Project
>;
