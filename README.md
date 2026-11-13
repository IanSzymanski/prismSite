# Prism site

Landing page for Prism, the content studio that turns raw material into complete documents. One page, built with Vite, plain HTML, CSS and a little JavaScript.

## Run it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`npm run build` writes a static site to `dist/`. Asset paths are relative, so it can be served from any folder or host. `npm run preview` serves the built site locally.

## What is where

| Path | What it holds |
|---|---|
| `index.html` | All page markup and copy |
| `src/partials/scene.svg` | The hero illustration, included into the page at build time |
| `src/styles/tokens.css` | Prism tokens (light and dark) plus the web extensions |
| `src/styles/base.css` | Reset, type, buttons, header, footer and shared components |
| `src/styles/hero.css` | Hero layout, the sticky stage and the scene's paint |
| `src/styles/sections.css` | Tabs, format mocks, brand switcher, ledger, FAQ, form |
| `src/scripts/scrolly.js` | The scroll-driven hero timeline (GSAP) |
| `src/scripts/*.js` | Theme toggle, nav, reveals, tabs, ledger, sign-up form |
| `vite.config.js` | Inlines the partial and a Phosphor Regular icon sprite |

Icons come from `@phosphor-icons/core` (Regular weight) at build time. To add one, add its name to `ICONS` in `vite.config.js` and reference it with `<use href="#i-name"/>`.

## The hero

The hero is a sticky stage beside four steps that scroll past it as normal text. Scroll position maps to one GSAP timeline with four segments: Draft, Proof, Approve, Produce. The mapping is measured from the real step positions, so it holds at any text size or viewport.

- Wide screens show the whole scene. Narrow screens move a camera (the SVG `viewBox`) to keep the active part readable.
- With reduced motion on, nothing moves. Each step swaps in whole with a short fade.
- Without JavaScript, the scene rests on its last frame and the steps read as plain text.
- Scene geometry lives at the top of `scrolly.js` and in `scene.svg`. Both use the same 720 by 600 units.

## Design system

The baseline is the Prism design system: tokens, type, the spectrum motif, flat cards, the source band and the closing panel. Component classes ported from it keep the `pt-` prefix.

This site extends it for the web:

- **Fluid type.** Title, heading and lede sizes scale with the viewport (`--fs-*`). Body text is 16px.
- **Motion tokens.** Four durations and three easings (`--dur-*`, `--ease-*`), with a reduced-motion path for every animation.
- **Interaction states.** Hover, pressed and a 2px accent focus ring on every control. Touch targets are at least 44px.
- **New components.** Site header, step rail, tabs, segmented control, accordion, form field, format mocks on the desk ground.
- **The delivery fan.** In the hero the four bands leave the prism and end on the formats they produce.
- **Scoped themes.** `data-theme="dark"` or `"light"` works on any element, so a dark section or a white print mock holds in either page theme.

## Accessibility

- One `h1`, ordered headings, landmarks, a skip link and labelled navigation.
- Everything works by keyboard: the step rail, tabs (arrow keys, Home, End), the brand switcher (native radios), the figure buttons, the accordion and the form.
- The hero illustration is decorative; the steps beside it carry the same content as text.
- No animation loops. Motion is tied to scrolling or to a pointer, and it stops under `prefers-reduced-motion`.
- Colour pairs follow the contrast notes in the design system. The page passes axe (WCAG 2.2 AA rules) in both themes at phone and desktop widths.
- The layout reflows from 320px wide with no horizontal scrolling.

## Before launch

- **Sign-up form.** It posts JSON (`{ "email": "…" }`) to `/api/request-access`. That endpoint does not exist yet. Until it does, the form shows its error state. Change the `action` on the form in `index.html` to point elsewhere.
- **Sample content.** Riverbend Food Network, Dana Whitfield, Northline and every figure are sample data from the design system. They are labelled on the page. Replace them with real customers and numbers.
- **Logo.** The glyph and wordmark are redrawn from the design system's description. Swap in the official `prism-logo.svg` files where the `.logo` markup appears.
- **Share image.** `og:image` is a relative path. Social networks need an absolute URL, so set it once the domain is known.

## Licences

Bricolage Grotesque and IBM Plex are under the SIL Open Font License (`licenses/`). Phosphor Icons and GSAP are used under their own licences.
