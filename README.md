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

The site runs on Cloudflare Workers as a static-assets Worker named `prism`, at https://prism.iszymanski.workers.dev. `wrangler.jsonc` points the Worker at `dist/`. Workers Builds is connected to this repo: every push to the default branch runs `npm run build`, then `npx wrangler deploy`. Pushes to other branches build a Preview with `npx wrangler preview`, which needs the `previews` block in `wrangler.jsonc` (it can stay empty). To deploy by hand, run `npm run deploy` after `npx wrangler login`.

## What is where

| Path | What it holds |
|---|---|
| `index.html` | All page markup and copy |
| `src/assets/logo/` | The Prism logo and glyph exactly as supplied by the design system, and the logo's silhouette for masking |
| `public/` | Favicons (SVG, ICO, Apple touch icon), the share image, and `_headers` (cache rules for Cloudflare) |
| `src/partials/scene.svg` | The "How it works" illustration and its glow layer, included into the page at build time |
| `src/styles/tokens.css` | Colour (light and dark), the spectrum, gradients, the glow shape, type, radius, shadow and motion tokens |
| `src/styles/base.css` | Reset, type, buttons, cards, header, footer, reveals and the motion-off rules |
| `src/styles/hero.css` | The hero, its five sample design systems, the four outputs they restyle, and the plain-content state it builds from |
| `src/styles/how.css` | The scrollyteller: backdrop, pinned stage, rail, steps and scene paint, and the flowing fallback |
| `src/styles/sections.css` | Stats, marquee, tabs, format mocks, brand tuner, ledger, pipelines, case study, FAQ, closing panel |
| `src/scripts/hero.js` | The design-system rotation in the hero and its wipe, and when the hero builds itself |
| `src/scripts/hero-build.js` | The opening: the brand check, the cursor's edit and approval, then the call to style it |
| `src/scripts/scrolly.js` | "How it works": the GSAP timeline and the scroll marks that step through it. Loaded as its own chunk |
| `src/scripts/offscreen.js` | Pauses the hero's and the scrollyteller's endless loops while they are off screen |
| `src/scripts/main.js` | Starts each part, and loads the scrollyteller once the page is idle or the section is reached |
| `src/scripts/motion.js` | The motion switch every animation checks |
| `src/scripts/pointer.js` | Spotlight cards, tilting mocks, magnetic buttons, pipeline replays |
| `src/scripts/brand.js` | The design-system picker and the "Yours" controls |
| `src/scripts/*.js` | Theme toggle, header, reveals, tabs, ledger wire |
| `vite.config.js` | Inlines the partial and one sprite: Phosphor Regular icons and the two logo symbols |

Icons come from `@phosphor-icons/core` (Regular weight) at build time. To add one, add its name to `ICONS` in `vite.config.js` and reference it with `<use href="#i-name"/>`.

## The logo

The logo is the design system's own artwork (Prism design system, Logos group), kept byte for byte in `src/assets/logo/`. It is never redrawn: the build turns each file into a sprite symbol (`#prism-logo`, `#prism-glyph`) with the same paths, and only swaps each fill for a custom property whose fallback is the supplied colour. One copy can then show any supplied version:

| Version | Wordmark | Glyph | Where |
|---|---|---|---|
| Colour | `--logo-ink: #010202` | amber, blue, red | Light grounds |
| Colour, reversed | `--logo-ink: #fff` | amber, blue, red | Dark grounds |
| One colour | `#010202` | all `--logo-ink` | The header over Kiln's orange (the colour glyph never sits on a hue fill) |

- **Light or dark by what is behind it.** `--logo-ink` is a theme token, so every logo takes the ink of the ground under it. The header already reads its theme from the section under it (`data-header-tone`); the hero now also sets `data-header-logo="mono"` while Kiln shows, and the header passes it on as `data-logo`.
- **Where it appears.** The header and footer, the giant footer mark, the Prism system's four hero outputs, every format mock, and the brand demo's Prism preset. The carousel's middle panel and the email sign-off use the glyph alone, as the brand book asks.
- **Use it.** `<svg viewBox="0 0 234.49 57.39" aria-hidden="true"><use href="#prism-logo"/></svg>`; the glyph is `viewBox="0 0 66.26 57.39"` with `#prism-glyph`. Size it by the whole artwork box, which includes the "p" descender.
- **The footer mark.** The giant logo at the foot of the page is the spectrum under a soft wash of ink, fading downward at 55% strength. It is a block cut to the logo's silhouette (`prism-logo-mask.svg`: the supplied wordmark paths, unchanged, and the glyph as one ring so no seams show) by one mask layer and faded by a second. In forced colours it is solid `CanvasText`.
- **Favicons.** `favicon.svg` is the supplied glyph's polygons in a square box; `favicon.ico` (16, 32, 48) and `apple-touch-icon.png` (the glyph on Prism's dark ground) are rendered from it.

## The hero

### How it opens

On a visit to the top of the page with motion on, the hero builds itself in Prism's own order before it shows its usual face.

1. **Draft.** The page opens on the hero's words as a plain `content.md`: Markdown in IBM Plex Mono on a flat ground, with the four outputs as dashed slots named for the files they will become. The blocks arrive in turn and the heading types itself. This part is pure CSS, so it draws with the first paint.
2. **Proof.** A scan line runs the brand and claim checks down the draft. Every block gets a tick except the heading, where the brand check flags "output" and asks for "format".
3. **Edit.** A cursor labelled "You" comes in, double-clicks the word, retypes it, and the flag clears.
4. **Approve.** The cursor presses Approve in the file bar.
5. **Produce.** The Prism design system wipes over the draft with the usual spectrum edge, and the four outputs are made as it passes. Then the rotation starts.

It takes about seven seconds, and the words, links and buttons work the whole time. How it fits together:

- **One switch.** The script in `<head>` sets `data-intro` on `<html>` before the first paint. Every plain-content rule in `hero.css` sits under `:root[data-intro] [data-skin]`, so it applies to the live skin only and never to the copies the wipe makes.
- **Nothing replays.** Those rules change how things look, never which animation runs, so the styled hero's own animations run underneath from the start. When the copy is swapped for the live skin, both are at the same point. Transitions are switched off for the one frame where `data-intro` comes off.
- **No layout shift.** While it builds, the section holds the styled layout's height under the skin (measured from a hidden copy once fonts have loaded and the page is idle, and again just before the styling lands), so nothing moves, inside the hero or below it.
- **Skips.** It goes straight to the styled hero when motion is off or switched off mid-way, when the page opens on another section (`#faq` and so on) or scrolled down, when the hero leaves the screen, and when the tab is hidden. If `hero.js` does not claim the build within three seconds, the head script shows the styled hero.
- **Assistive tech.** The heading reads "One draft, every format" throughout: the draft word "output" is a decorative copy, and the Markdown punctuation, file bar, cursor, ticks and flag are hidden from assistive tech.
- **Timing.** The CSS sets the draft (`--raw-at` delays and `raw-type`). `hero-build.js` sets the rest, measured from the heading's own animation so the two stay in step.

To change the edit, change the two words in the heading: `.hero__was` is the draft word, `.hero__now` the approved one. The flag text and the typing follow them.

### Five design systems

The hero shows one layout in five sample design systems: Prism, Riverbend, Northline, Kiln and Halcyon. Each is a block of tokens on `.hero__skin[data-sys]` in `hero.css` (ground, ink, accent, display font, case, radius, glow colours, and a second set for the four output cards). Riverbend, Northline, Kiln and Halcyon are fictional and labelled so on the page.

- **Rotation.** The hero moves to the next system every 4.8 seconds. It stops while the pointer or focus is on the switcher, when the pause button beside it is pressed, when the hero is off screen, and when motion is off.
- **The change.** The next system is a copy of the skin laid over the current one and revealed along a diagonal, with a line of spectrum on the edge. The copy is hidden from assistive tech and removed when the wipe ends. Its animations start with a negative delay (`--age`) so nothing replays or jumps.
- **Stable layout.** The headline sits in one fixed-height box in every system, so the text and buttons under it never move.
- **Header.** The hero sets `data-header-tone` to light or dark, and the header takes its ink from that.
- **Fonts.** Instrument Serif (Riverbend) and Anton (Kiln) are fetched once the page is idle, after the opening when there is one, and awaited before their system shows.
- **Logo.** The header shows the colour logo, with a white or black wordmark to suit the system's ground, and the one-colour black logo over Kiln. In the Prism system the outputs carry the Prism logo too.
- **Fallbacks.** With motion off, picking a system swaps it at once. Without JavaScript the hero stays on Prism and the switcher is hidden, and it never opens as plain content.

To add a system: add a token block in `hero.css`, a button in the switcher in `index.html`, and an entry in `ORDER` and `TONE` in `hero.js` (and in `LOGO`, if the header should show the one-colour logo over it).

## How it works (the scrollyteller)

Below the hero, a dark stage in every theme. The section is a tall track (`100svh` plus `--step-gap`, 80% of the screen, per step) with one screen-high panel pinned inside it: the scene and its step rail, beside the text on wide screens and above it on narrow ones. The intro and the four steps (Draft, Proof, Approve, Produce) share one place in the panel and show one at a time.

Scrolling doesn't scrub the scene. Each step has a mark, spaced evenly through the track, so every change takes its own stretch of scrolling. Crossing a mark swaps the text and plays the whole change on one GSAP timeline in time: about 1.4 to 2.1 seconds, set per step in `PLAY` at the top of `scrolly.js`. Scrolling back plays it in reverse; passing several marks at once plays through them faster. The marks are measured fresh from the section's position, so they hold at any viewport.

- **Rail.** The four lights fill as the story moves. Each is a link: it scrolls to that step's stretch and starts it.
- **Keyboard.** Focus on a link inside a step that isn't showing (the "See the formats" link) brings that step forward first.
- **Short screens and large text.** Under 36em tall (a landscape phone, or zoomed text), the panel would clip, so the section keeps its flowing layout: the scene sticks at the top and the steps scroll past as text. Each step still plays its whole change when its text reaches the middle of the view.
- **Loading.** The scene and GSAP load as their own chunk once the page is idle, or as soon as the section comes into view. If the chunk fails, the page marks itself `no-scrolly` and the section flows; if the page script never runs, the head script does the same after eight seconds.

- **Light.** Rays and the beam are drawn once and mirrored into a blurred layer behind them (`.scene-glow` uses `<use>`), which gives the bloom without SVG filters.
- **Backdrop.** Three soft colour fields sit behind the stage. Their main colour follows the step being told: red, amber, green, blue.
- **Camera.** Wide screens show the whole scene. Narrow screens move the SVG `viewBox` to keep the active part readable.
- **Motion off.** Nothing moves. The panel stays pinned and each step swaps in whole, the scene with a short fade.
- **No JavaScript.** The section flows: the scene rests on its last frame and the steps read as plain text.

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

## Performance

Measured with Lighthouse 12 on the production build, before and after this pass (mobile is the simulated mid-range phone with a 4x slower CPU):

| | Mobile before | Mobile after | Desktop before | Desktop after |
|---|---|---|---|---|
| Score | 89 | 96 | 100 | 100 |
| Largest contentful paint | 3.1 s | 2.4 s | 0.7 s | 0.5 s |
| Total blocking time | 210 ms | 140 ms | 0 ms | 0 ms |
| Layout shift | 0.022 | 0 | 0 | 0 |
| Main-thread work | 6.1 s | 3.2 s | 1.8 s | 0.8 s |
| Script loaded up front | 148 kB (56 kB gzip) | 25 kB (9 kB gzip) | | |

What changed, none of it visible:

- **Offscreen sections skip rendering.** Every section below the scrollyteller, and the footer, has `content-visibility: auto`, with its usual content-box height as `contain-intrinsic-size` (per phone, tablet and desktop width, in `base.css`) so the page length and in-page links stay exact. Their loops (marquee, spectrum text) stop while they are skipped. If a section's content changes a lot, update its `--cis`.
- **Loops pause off screen.** The hero and the scrollyteller always render; `offscreen.js` pauses their CSS animations while they are out of view.
- **The scrollyteller loads later.** It and GSAP are a separate 83 kB chunk (32 kB gzip), loaded at idle or when the section is reached. It no longer uses ScrollTrigger.
- **No forced layouts at startup.** The hero measures its styled height at idle, and the format tabs place their ink when the tabs are laid out.
- **No repaint loops in the opening.** The placeholder shimmer moves by `transform` rather than `background-position`.
- **Fonts in order.** IBM Plex Mono (the opening's first paint) is preloaded; the sample systems' fonts wait until the opening has landed.
- **Caching.** `public/_headers` lets browsers keep everything under `/assets/` (fingerprinted by Vite) for a year, and icons and the share image for a day.

## Interactions

- Header: a floating glass bar with page progress, a pill that slides between links, and ink that flips over dark sections.
- Theme toggle: the new theme opens as a circle from the button (View Transitions, where supported).
- Format tabs: an ink block slides to the chosen tab; the mock leans toward the pointer.
- Design-system picker: three presets, plus "Yours" with accent colour, type, ground and corner radius. Three sample outputs restyle together.
- Review: choosing a figure draws a wire to its source.
- Ways to work: a pulse runs each pipeline when its card arrives, and again on hover or focus.

## Accessibility

- One `h1`, ordered headings, landmarks, a skip link and labelled navigation.
- Everything works by keyboard: the step rail, tabs (arrow keys, Home, End), the pickers (native radios, colour and range inputs), the figure buttons and the accordion.
- **Motion can be paused.** The pause button in the header stops every loop, reveal and scroll-linked animation, and the choice is remembered. It starts paused when the system asks for reduced motion. Pausing during the hero's opening jumps straight to the styled hero. The hero rotation also has its own pause button.
- Split headings keep a plain copy for screen readers; the animated pieces are hidden from them.
- The scrollyteller's scene is decorative; the steps beside it carry the same content as text. All four steps stay readable by assistive tech while one shows, and the section falls back to flowing text when the screen is too short for the pinned panel.
- The page passes axe (WCAG 2.2 AA rules) in both themes at phone and desktop widths, and reflows from 320px with no horizontal scrolling.

## Before launch

- **Calls to action.** Every "Get Prism" button (header, menu, hero and closing panel) links to the Prism repository, https://github.com/IanSzymanski/prism. To send them somewhere else, change those four `href`s in `index.html`.
- **Sample content.** Riverbend Food Network, Dana Whitfield, the Northline, Kiln and Halcyon brands, and every figure are sample data. They are labelled on the page. Replace them with real customers and numbers.
- **Share image.** `og.png` carries the new logo. `og:image` is a relative path; social networks need an absolute URL, so set it once the domain is known.

## Licences

Bricolage Grotesque, IBM Plex, Instrument Serif and Anton are under the SIL Open Font License (`licenses/`). Phosphor Icons and GSAP are used under their own licences.
