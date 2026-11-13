const KEY = 'prism-theme';

export function initTheme() {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const current = () => root.dataset.theme || (system.matches ? 'dark' : 'light');
  const label = () => button.setAttribute('aria-label', `Switch to ${current() === 'dark' ? 'light' : 'dark'} theme`);

  const apply = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch { /* private mode */ }
    label();
  };

  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    if (document.startViewTransition && !reduce.matches) document.startViewTransition(() => apply(next));
    else apply(next);
  });
  system.addEventListener('change', label);
  label();
}
