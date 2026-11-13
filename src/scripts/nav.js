export function initNav() {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('site-nav');
  if (!header || !toggle || !nav) return;

  // Hairline under the header once the source band has scrolled away.
  const band = document.querySelector('.source-band');
  if (band && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => header.classList.toggle('is-stuck', !entry.isIntersecting)).observe(band);
  }

  // Small screens: the nav is a disclosure under the header.
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setOpen(!isOpen()));
  nav.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', (event) => {
    if (isOpen() && !header.contains(event.target)) setOpen(false);
  });
  window.matchMedia('(min-width: 60em)').addEventListener('change', () => setOpen(false));

  // Mark the section being read.
  if (!('IntersectionObserver' in window)) return;
  const links = [...nav.querySelectorAll('.site-nav__link')];
  const bySection = new Map(links.map((a) => [document.querySelector(a.hash), a]).filter(([el]) => el));
  const visible = new Set();
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
    let currentLink = null;
    bySection.forEach((link, section) => { if (visible.has(section)) currentLink = link; });
    links.forEach((a) => (a === currentLink ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }, { rootMargin: '-45% 0px -50% 0px' });
  bySection.forEach((_, section) => spy.observe(section));
}
