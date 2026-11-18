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

function sprite() {
  const dir = resolve(root, 'node_modules/@phosphor-icons/core/assets/regular');
  const symbols = ICONS.map((name) => {
    const svg = readFileSync(resolve(dir, `${name}.svg`), 'utf8');
    const inner = svg.replace(/<svg[^>]*>/, '').replace('</svg>', '');
    return `<symbol id="i-${name}" viewBox="0 0 256 256">${inner}</symbol>`;
  }).join('');
  return `<svg class="sprite" xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false">${symbols}</svg>`;
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
