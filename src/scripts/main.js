import { initMotion } from './motion.js';
import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initHero } from './hero.js';
import { initReveal } from './reveal.js';
import { initPointer } from './pointer.js';
import { initTabs } from './tabs.js';
import { initBrand } from './brand.js';
import { initLedger } from './ledger.js';
import { initSignup } from './signup.js';
import { initScrolly } from './scrolly.js';

// Each part stands alone: one failing must not take the page down.
[initMotion, initTheme, initNav, initHero, initReveal, initPointer, initTabs, initBrand, initLedger, initSignup, initScrolly].forEach((init) => {
  try {
    const result = init();
    if (result && typeof result.catch === 'function') result.catch((error) => console.error(error));
  } catch (error) {
    console.error(error);
  }
});
