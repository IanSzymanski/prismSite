import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Phosphor Regular icons inlined as one sprite.
const ICONS = [
  'arrow-down', 'arrow-up', 'check', 'sun', 'moon', 'list', 'x',
  'book', 'globe', 'users', 'paper-plane-tilt', 'plus', 'arrow-up-right', 'file-text',
  'swatches', 'squares-four', 'text-aa',
  'megaphone-simple', 'seal-check', 'lightning', 'link-simple', 'pause', 'play', 'ruler', 'sparkle',
];

const root = import.meta.dirname;

// The Prism logo, as supplied by the design system (src/assets/logo, kept byte for byte). Its paths are used
// unchanged; each fill becomes a custom property whose fallback is the supplied colour, so one copy can show
// any supplied variant: colour, white wordmark (--logo-ink: #fff) or one colour (every property set to one ink).
const LOGO_FILLS = { '#010202': 'ink', '#769df8': 'blue', '#e7707f': 'red', '#eaa440': 'amber' };
const LOGOS = { 'prism-logo': 'prism-logo.svg', 'prism-glyph': 'prism-glyph.svg' };

function logoSymbol(id, file) {
  const svg = readFileSync(resolve(root, 'src/assets/logo', file), 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/fill="(#[0-9a-f]{6})"/gi, (_, hex) => {
      const name = LOGO_FILLS[hex.toLowerCase()];
      if (!name) throw new Error(`${file}: unexpected logo colour ${hex}`);
      return `style="fill:var(--logo-${name},${hex});transition:fill .45s"`;
    });
  return `<symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`;
}

function sprite() {
  const dir = resolve(root, 'node_modules/@phosphor-icons/core/assets/regular');
  const symbols = ICONS.map((name) => {
    const svg = readFileSync(resolve(dir, `${name}.svg`), 'utf8');
    const inner = svg.replace(/<svg[^>]*>/, '').replace('</svg>', '');
    return `<symbol id="i-${name}" viewBox="0 0 256 256">${inner}</symbol>`;
  }).join('');
  const logos = Object.entries(LOGOS).map(([id, file]) => logoSymbol(id, file)).join('');
  return `<svg class="sprite" xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false">${symbols}${logos}</svg>`;
}

function htmlPartials() {
  return {
    name: 'prism-html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace(/<!--\s*@include\s+(\S+)\s*-->/g, (_, file) => readFileSync(resolve(root, file), 'utf8'))
          .replace(/<!--\s*@icons\s*-->/, sprite());
      },
    },
    configureServer(server) {
      const dir = resolve(root, 'src/partials');
      server.watcher.add(dir);
      server.watcher.on('change', (file) => {
        if (file.startsWith(dir)) server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [htmlPartials()],
  build: { target: 'es2022', cssMinify: true },
});
