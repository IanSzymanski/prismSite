export function initNav() {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('site-nav');
  if (!header || !toggle || !nav) return;
  const list = nav.querySelector('[data-nav-list]');
  const links = [...nav.querySelectorAll('.site-nav__link')];
  const zones = [...document.querySelectorAll('[data-header-tone]')];

  // Glass once scrolled, page progress along the bar, and ink that suits the section under it.
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-stuck', y > 12);
    header.style.setProperty('--page-p', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
    const probe = 38;
    const zone = zones.find((z) => { const r = z.getBoundingClientRect(); return r.top <= probe && r.bottom > probe; });
    if (zone) header.setAttribute('data-theme', zone.dataset.headerTone); else header.removeAttribute('data-theme');
    // Some grounds take the one-colour logo (Kiln's orange): the colour glyph must not sit on a hue fill.
    if (zone && zone.dataset.headerLogo) header.dataset.logo = zone.dataset.headerLogo; else delete header.dataset.logo;
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  document.addEventListener('prism:tone', request);
  update();

  // A pill slides under whichever link has the pointer or focus, and rests on the current section.
  const movePill = (link) => {
    if (!link) { list.style.setProperty('--o', '0'); return; }
    list.style.setProperty('--x', `${link.offsetLeft}px`);
    list.style.setProperty('--w', `${link.offsetWidth}px`);
    list.style.setProperty('--o', '1');
  };
  const rest = () => movePill(links.find((a) => a.hasAttribute('aria-current')) || null);
  links.forEach((link) => {
    link.addEventListener('pointerenter', () => movePill(link));
    link.addEventListener('focus', () => movePill(link));
  });
  list.addEventListener('pointerleave', rest);
  list.addEventListener('focusout', (event) => { if (!list.contains(event.relatedTarget)) rest(); });

  // Small screens: the nav is a disclosure under the bar.
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
  const bySection = new Map(links.map((a) => [document.querySelector(a.hash), a]).filter(([el]) => el));
  const visible = new Set();
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
    let currentLink = null;
    bySection.forEach((link, section) => { if (visible.has(section)) currentLink = link; });
    links.forEach((a) => (a === currentLink ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    if (!list.matches(':hover') && !list.contains(document.activeElement)) rest();
  }, { rootMargin: '-45% 0px -50% 0px' });
  bySection.forEach((_, section) => spy.observe(section));
}
