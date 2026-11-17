# Zaw Lin Naing · Portfolio

My personal site: https://normanlinn.github.io/portfolio/

It shows four projects I built (LAXCommute, Yay Kyaw Nights, Burman Tea and Derivatives Field Guide), a short introduction, my toolkit and a way to get in touch.

## How it is built

The page is hand-written HTML and CSS in `dist/`. Interactivity and motion are written in TypeScript in `src/` and bundled with esbuild; animation uses Framer Motion's browser API. There is no framework, server or database.

```bash
npm ci
npm run build   # type-checks, bundles src/ into dist/, then copies dist/ to docs/
npm test        # checks the built site in docs/
```

GitHub Pages publishes `docs/` on every push to `main`. The build adds a content hash to each stylesheet and script link so visitors never get a new page with old cached styles.

## What the tests check

- every local file the page refers to exists
- every email link goes to the right address
- links that open a new tab use `rel="noopener"`
- the content security policy and referrer policy are present
- search, share-card and structured-data metadata is complete, and every project in the structured data is linked on the page
- the sitemap and `llms.txt` point at the live site
- the source has no empty `catch` blocks or stray `console.log`

The "Repository health" workflow runs `npm audit`, the build and these tests on every push and pull request.

## Search and AI discoverability

- `<head>` has a title, description, canonical URL, Open Graph and Twitter card tags, and JSON-LD describing me (`Person`) and my projects.
- `sitemap.xml` lists the pages worth indexing. GitHub Pages only reads `robots.txt` from the root of `normanlinn.github.io`, so submit the sitemap in Google Search Console.
- `llms.txt` is a plain-language summary for AI assistants.

## Editing

- Text and layout: `dist/index.html` and the stylesheets in `dist/` (`effects.css` is the newest layer).
- Project popups and skills: `src/script.ts` and `src/skills.ts`, then `npm run build`.
- Résumé: edit `resume/resume.html`, open it in Chrome, print to PDF and save over `dist/assets/zaw-lin-naing-resume.pdf`.
- Share image: edit `resume/social-card.html`, then render it at 1200 × 630:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1200,630 --allow-file-access-from-files --screenshot="$PWD/social.png" "file://$PWD/resume/social-card.html"
```

Fonts are Instrument Sans and Instrument Serif (SIL Open Font License, see `dist/assets/font-license.txt`).
