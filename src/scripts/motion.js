// One switch for all ambient and scroll-linked movement. Starts from the system setting; the header button overrides it.
const KEY = 'prism-motion';
const root = document.documentElement;

export const motionOn = () => root.dataset.motion !== 'off';

export function onMotionChange(fn) {
  document.addEventListener('prism:motion', fn);
  return () => document.removeEventListener('prism:motion', fn);
}

export function initMotion() {
  const button = document.querySelector('[data-motion-toggle]');
  const system = window.matchMedia('(prefers-reduced-motion: reduce)');
  let chosen = false;
  try { chosen = ['on', 'off'].includes(localStorage.getItem(KEY)); } catch { /* private mode */ }

  const set = (value, remember) => {
    root.dataset.motion = value;
    if (remember) { chosen = true; try { localStorage.setItem(KEY, value); } catch { /* private mode */ } }
    if (button) button.setAttribute('aria-pressed', String(value === 'off'));
    document.dispatchEvent(new CustomEvent('prism:motion'));
  };

  if (button) {
    button.setAttribute('aria-pressed', String(!motionOn()));
    button.addEventListener('click', () => set(motionOn() ? 'off' : 'on', true));
  }
  system.addEventListener('change', (event) => { if (!chosen) set(event.matches ? 'off' : 'on', false); });
}
