import { initMotion } from './motion.js';
import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initHero } from './hero.js';
import { initReveal } from './reveal.js';
import { initPointer } from './pointer.js';
import { initTabs } from './tabs.js';
import { initBrand } from './brand.js';
import { initLedger } from './ledger.js';
import { initOffscreen } from './offscreen.js';

// "How it works" and GSAP load as their own chunk, once the page is idle or as soon as the section comes into view,
// so the first frames (and the hero's opening) don't wait on them.
function initScrollyLater() {
  const section = document.querySelector('[data-scrolly]');
  if (!section) return;
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    import('./scrolly.js').then((module) => module.initScrolly()).catch((error) => {
      document.documentElement.classList.add('no-scrolly'); // keep the steps readable in the flowing layout
      console.error(error);
    });
  };
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { near.disconnect(); start(); }
    });
    near.observe(section);
  }
  if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 2000 }); else setTimeout(start, 1500);
}

document.documentElement.setAttribute('data-ready', '');

// Each part stands alone: one failing must not take the page down.
[initMotion, initTheme, initNav, initHero, initReveal, initPointer, initTabs, initBrand, initLedger, initOffscreen, initScrollyLater].forEach((init) => {
  try {
    const result = init();
    if (result && typeof result.catch === 'function') result.catch((error) => console.error(error));
  } catch (error) {
    console.error(error);
  }
});
