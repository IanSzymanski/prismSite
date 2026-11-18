// The hero and the scrollyteller run endless loops (drifting glows, floating cards, flowing rays). Pause them
// while the section is off screen, so the page does no animation work nobody can see. The sections below them
// skip rendering on their own (content-visibility in base.css).
export function initOffscreen() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting));
  }, { rootMargin: '10% 0px' });
  document.querySelectorAll('[data-hero], [data-scrolly]').forEach((section) => observer.observe(section));
}
