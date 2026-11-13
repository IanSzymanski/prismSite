import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initReveal } from './reveal.js';
import { initTabs } from './tabs.js';
import { initLedger } from './ledger.js';
import { initSignup } from './signup.js';
import { initScrolly } from './scrolly.js';

// Each part stands alone: one failing must not take the page down.
[initTheme, initNav, initReveal, initTabs, initLedger, initSignup, initScrolly].forEach((init) => {
  try {
    const result = init();
    if (result && typeof result.catch === 'function') result.catch((error) => console.error(error));
  } catch (error) {
    console.error(error);
  }
});
