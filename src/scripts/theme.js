import { motionOn } from './motion.js';

const KEY = 'prism-theme';

export function initTheme() {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const current = () => root.dataset.theme || (system.matches ? 'dark' : 'light');
  const label = () => button.setAttribute('aria-label', `Switch to ${current() === 'dark' ? 'light' : 'dark'} theme`);

  const apply = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch { /* private mode */ }
    label();
  };

  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || !motionOn()) { apply(next); return; }
    // The new theme opens as a circle from the button.
    const box = button.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.classList.add('theme-wipe');
    const transition = document.startViewTransition(() => apply(next));
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
    transition.finished.finally(() => root.classList.remove('theme-wipe'));
  });
  system.addEventListener('change', label);
  label();
}
