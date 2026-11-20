# ZLN Terminal

**Zaw Lin Naing’s developer portfolio — from aviation to software.**

[Live portfolio](https://normanlinn.github.io/) · [GitHub](https://github.com/normanlinn) · [Email](mailto:mrzawlinnaing1001@gmail.com)

## Two versions, one journey

| Version | Where to find it |
| --- | --- |
| Current published portfolio | [normanlinn.github.io](https://normanlinn.github.io/) |
| Preserved version before the 3D redesign | [`archive/pre-airport-3d-20261119`](https://github.com/normanlinn/normanlinn.github.io/tree/archive/pre-airport-3d-20261119) |
| New walkable airport prototype | [`feature/swiss-airport-3d`](https://github.com/normanlinn/normanlinn.github.io/tree/feature/swiss-airport-3d/airport) |

The airport is an experimental, playable **Three.js + TypeScript** experience. It is being developed separately from the published site.

## Explore the terminal

- **Arrivals:** enter a 3D terminal with a red floor route and an aircraft beyond the windows.
- **Gates A1–A4:** open real developer projects from the gate screens or departures board.
- **Developer desk:** explore my tools and technologies.
- **Developer pass:** read about my path from aviation customer service at LAX to building software.
- **First Class Lounge:** open a boarding-pass contact panel, copy my email, or view my résumé.

There are moving luggage cases, opening security doors, a smooth airliner with animated engine fans and retracting gear, landing and takeoff sequences viewed through the terminal glass, smooth camera journeys, a pause-ambience control, and a directory that makes every destination accessible without walking.

### Controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Walk | **W A S D** or arrow keys | Drag the left joystick |
| Look | Drag the scene; optional **Mouse look** | Drag the scene |
| Open a destination | Click a screen, or **E** when prompted nearby | Tap a screen or the interaction button |
| Jump to an area | Top navigation | Top navigation |
| Close a panel | **Escape** or the close button | Close button |
| Release mouse look | **Escape** | — |

Choose **Watch runway** to reach the observation windows, then select **Landing**, **Takeoff**, or **Park aircraft**. Flights stay outside the terminal. **Pause ambience** also pauses the aircraft. Reduced-motion mode keeps ambient flight motion off; selecting a flight explicitly starts that sequence.

The **directory button** opens all projects and contact details directly. The prototype respects the system’s reduced-motion preference. **Pause ambience** stops the decorative luggage and route animation.

## Run the 3D prototype

Use a recent Node.js release. Switch to the prototype branch, then run these commands from the repository root:

```sh
git fetch origin
git switch feature/swiss-airport-3d
npm --prefix airport ci
npm run airport:build
npm run airport:dev
```

Open **[http://127.0.0.1:4180](http://127.0.0.1:4180)**. The build checks TypeScript and creates the standalone static site in `airport/dist/`. Serve that folder over HTTP; opening the HTML directly as a local file is not supported.

### Run checks

```sh
npm --prefix airport test
```

With the preview server running, install a Playwright browser once and run the browser checks:

```sh
cd airport
npx playwright install chromium
npm run test:browser
```

Set `CHROME_PATH` to use an already installed Chrome executable.

## Source map

| Path | Purpose |
| --- | --- |
| `airport/src/aircraft.ts`, `airport/src/flight.ts` | Smooth aircraft geometry and deterministic landing/takeoff paths |
| `airport/src/main.ts` | Scene geometry, lighting, walking, collisions, gate interactions, and panels |
| `airport/index.html` | Arrival UI, navigation, directory, and accessible fallback links |
| `airport/site.css` | Responsive typography, rounded interface, panels, and transitions |
| `airport/build.mjs` | Type checking/bundling output and local asset preparation |
| `airport/design/` | Visual concept and prototype screenshots |
| `src/`, `dist/`, `docs/` | Existing published portfolio and its build output |

## Real projects

| Gate | Project | Live site |
| --- | --- | --- |
| A1 | LAXCommute | [employeeshuttlelax.com](https://employeeshuttlelax.com/) |
| A2 | Yay Kyaw Nights | [yaykyawfair.vercel.app](https://yaykyawfair.vercel.app/) |
| A3 | Burman Tea | [burmantea.vercel.app](https://burmantea.vercel.app/) |
| A4 | Derivatives Field Guide | [normanlinn.github.io/calculus-study-site](https://normanlinn.github.io/calculus-study-site/) |

## Visual direction

The concept uses Swiss-inspired typography, white and charcoal surfaces, precise red wayfinding, and a first-class boarding-pass treatment. The aircraft and HON CIRCLE styling are part of the requested personal concept; this is a developer portfolio, not an airline booking service.

The image below is **art direction**, while the playable prototype uses original lightweight geometry. Matching the concept’s detailed architectural materials and character models is a later art pass.

![SWISS-inspired airport portfolio visual concept](https://raw.githubusercontent.com/normanlinn/normanlinn.github.io/feature/swiss-airport-3d/airport/design/swiss-terminal-concept.png)

### Playable prototype screenshot

![Current playable 3D prototype](https://raw.githubusercontent.com/normanlinn/normanlinn.github.io/feature/swiss-airport-3d/airport/design/prototype-desktop.png)

## Validation

- TypeScript check and production bundle.
- Browser checks for WebGL rendering, keyboard walking, navigation, project links, copy-email feedback, and phone layout.
- Reduced-motion mode, optional ambient animation, and an accessible destination directory.

## Ownership

Built and maintained by **[normanlinn — Zaw Lin Naing](https://github.com/normanlinn)**.
