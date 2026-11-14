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

## Hosting

The site runs on Cloudflare Workers as a static-assets Worker named `prism`, at https://prism.iszymanski.workers.dev. `wrangler.jsonc` points the Worker at `dist/`. Workers Builds is connected to this repo: every push to the default branch runs `npm run build`, then `npx wrangler deploy`. To deploy by hand, run `npm run deploy` after `npx wrangler login`.

## What is where

| Path | What it holds |
|---|---|
| `index.html` | All page markup and copy |
| `src/partials/scene.svg` | The "How it works" illustration and its glow layer, included into the page at build time |
| `src/styles/tokens.css` | Colour (light and dark), the spectrum, gradients, the glow shape, type, radius, shadow and motion tokens |
| `src/styles/base.css` | Reset, type, buttons, cards, header, footer, reveals and the motion-off rules |
| `src/styles/hero.css` | The hero, its five sample design systems and the four outputs they restyle |
| `src/styles/how.css` | The scrollyteller: backdrop, sticky stage, rail, steps and scene paint |
| `src/styles/sections.css` | Stats, marquee, tabs, format mocks, brand tuner, ledger, pipelines, case study, FAQ, closing panel |
| `src/scripts/hero.js` | The design-system rotation in the hero and its wipe |
| `src/scripts/scrolly.js` | The scroll-driven "How it works" timeline (GSAP) |
| `src/scripts/motion.js` | The motion switch every animation checks |
| `src/scripts/pointer.js` | Spotlight cards, tilting mocks, magnetic buttons, pipeline replays |
| `src/scripts/brand.js` | The design-system picker and the "Yours" controls |
| `src/scripts/*.js` | Theme toggle, header, reveals, tabs, ledger wire, sign-up form |
| `vite.config.js` | Inlines the partial and a Phosphor Regular icon sprite |

Icons come from `@phosphor-icons/core` (Regular weight) at build time. To add one, add its name to `ICONS` in `vite.config.js` and reference it with `<use href="#i-name"/>`.

## The hero

The hero shows one layout in five sample design systems: Prism, Riverbend, Northline, Kiln and Halcyon. Each is a block of tokens on `.hero__skin[data-sys]` in `hero.css` (ground, ink, accent, display font, case, radius, glow colours, and a second set for the four output cards). Riverbend, Northline, Kiln and Halcyon are fictional and labelled so on the page.

- **Rotation.** The hero moves to the next system every 4.8 seconds. It stops while the pointer or focus is on the switcher, when the pause button beside it is pressed, when the hero is off screen, and when motion is off.
- **The change.** The next system is a copy of the skin laid over the current one and revealed along a diagonal, with a line of spectrum on the edge. The copy is hidden from assistive tech and removed when the wipe ends. Its animations start with a negative delay (`--age`) so nothing replays or jumps.
- **Stable layout.** The headline sits in one fixed-height box in every system, so the text and buttons under it never move.
- **Header.** The hero sets `data-header-tone` to light or dark, and the header takes its ink from that.
- **Fonts.** Instrument Serif (Riverbend) and Anton (Kiln) are fetched just before they are first needed.
- **Fallbacks.** With motion off, picking a system swaps it at once. Without JavaScript the hero stays on Prism and the switcher is hidden.

To add a system: add a token block in `hero.css`, a button in the switcher in `index.html`, and an entry in `ORDER` and `TONE` in `hero.js`.

## How it works (the scrollyteller)

Below the hero, a dark stage in every theme. A sticky scene sits beside four steps that scroll past as normal text, and scroll position maps to one GSAP timeline with four segments: Draft, Proof, Approve, Produce. The mapping is measured from the real step positions, so it holds at any text size or viewport.

- **Light.** Rays and the beam are drawn once and mirrored into a blurred layer behind them (`.scene-glow` uses `<use>`), which gives the bloom without SVG filters.
- **Backdrop.** Three soft colour fields sit behind the stage. Their main colour follows the step being told: red, amber, green, blue.
- **Camera.** Wide screens show the whole scene. Narrow screens move the SVG `viewBox` to keep the active part readable.
- **Motion off.** Nothing moves. Each step swaps in whole with a short fade.
- **No JavaScript.** The scene rests on its last frame and the steps read as plain text.

Scene geometry lives at the top of `scrolly.js` and in `scene.svg`. Both use the same 720 by 600 units.

## Visual system

The page started from the Prism design system and now goes well past it. What it keeps: Bricolage Grotesque and IBM Plex, the four hues in order, the hue cycle for numbered things, the logo, and the voice. Classes that came from the system keep the `pt-` prefix.

What it adds:

- **Colour.** A full spectrum (`--s-red` to `--s-pink`), a second accent, and a cool ink scale for dark surfaces. Each theme has its own surface, line and glass values.
- **Gradients.** Spectrum text for the two headline words, accent gradients on heading words and buttons, hue washes behind sections, and gradient numerals.
- **Glows.** Every soft light uses one shape, `--glow`, whose falloff follows a bell curve so it has no visible edge. The fields are wide, tilted and overlapping, so they blend instead of reading as circles.
- **Depth.** Three shadow levels, glass surfaces with blur, and cards with a pointer-following spotlight.
- **Type.** Fluid sizes up to 92px for the hero, weight 800 for display, and headings that reveal word by word.
- **Motion.** Four durations, three easings, and one switch that turns all of it off.
- **Scoped themes.** `data-theme="dark"` or `"light"` works on any element. The scrollyteller, the review section and the closing panel are always dark; print and email mocks are always light.

## Interactions

- Header: a floating glass bar with page progress, a pill that slides between links, and ink that flips over dark sections.
- Theme toggle: the new theme opens as a circle from the button (View Transitions, where supported).
- Format tabs: an ink block slides to the chosen tab; the mock leans toward the pointer.
- Design-system picker: three presets, plus "Yours" with accent colour, type, ground and corner radius. Three sample outputs restyle together.
- Review: choosing a figure draws a wire to its source.
- Ways to work: a pulse runs each pipeline when its card arrives, and again on hover or focus.

## Accessibility

- One `h1`, ordered headings, landmarks, a skip link and labelled navigation.
- Everything works by keyboard: the step rail, tabs (arrow keys, Home, End), the pickers (native radios, colour and range inputs), the figure buttons, the accordion and the form.
- **Motion can be paused.** The pause button in the header stops every loop, reveal and scroll-linked animation, and the choice is remembered. It starts paused when the system asks for reduced motion. The hero rotation also has its own pause button.
- Split headings keep a plain copy for screen readers; the animated pieces are hidden from them.
- The hero illustration is decorative; the steps beside it carry the same content as text.
- The page passes axe (WCAG 2.2 AA rules) in both themes at phone and desktop widths, and reflows from 320px with no horizontal scrolling.

## Before launch

- **Sign-up form.** It posts JSON (`{ "email": "…" }`) to `/api/request-access`. That endpoint does not exist yet. Until it does, the form shows its error state. Change the `action` on the form in `index.html` to point elsewhere.
- **Sample content.** Riverbend Food Network, Dana Whitfield, the Northline, Kiln and Halcyon brands, and every figure are sample data. They are labelled on the page. Replace them with real customers and numbers.
- **Logo.** The glyph and wordmark are redrawn from the design system's description. Swap in the official `prism-logo.svg` files where the `.logo` markup appears.
- **Share image.** `og:image` is a relative path. Social networks need an absolute URL, so set it once the domain is known.

## Licences

Bricolage Grotesque, IBM Plex, Instrument Serif and Anton are under the SIL Open Font License (`licenses/`). Phosphor Icons and GSAP are used under their own licences.
