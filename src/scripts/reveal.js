import { motionOn } from './motion.js';

function countUp(el) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target) || target < 2 || !motionOn()) return;
  const duration = 1000 + Math.min(target, 90) * 8;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration);
    el.textContent = String(Math.round(target * (1 - (1 - p) ** 4)));
    if (p < 1) requestAnimationFrame(tick);
  };
  el.textContent = '0';
  requestAnimationFrame(tick);
}

// Split a heading into words that rise out of a mask. Readers get the plain sentence; the pieces are hidden from them.
function split(heading) {
  const plain = document.createElement('span');
  plain.className = 'sr-only';
  plain.textContent = heading.textContent.trim().replace(/\s+/g, ' ');
  const shown = document.createElement('span');
  shown.className = 'split';
  shown.setAttribute('aria-hidden', 'true');
  let index = 0;
  heading.childNodes.forEach((node) => {
    const accent = node.nodeType === Node.ELEMENT_NODE;
    node.textContent.split(/(\s+)/).forEach((piece) => {
      if (!piece) return;
      if (/^\s+$/.test(piece)) { shown.append(' '); return; }
      const mask = document.createElement('span');
      mask.className = 'w';
      const word = document.createElement('span');
      if (accent) word.className = 'is-em';
      word.textContent = piece;
      word.style.setProperty('--w', String(index));
      index += 1;
      mask.append(word);
      shown.append(mask);
    });
  });
  heading.replaceChildren(plain, shown);
}

export function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length || !('IntersectionObserver' in window)) return;
  if (motionOn()) document.querySelectorAll('[data-split]').forEach(split);
  document.documentElement.classList.add('reveal-ready');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      entry.target.querySelectorAll('[data-count]').forEach(countUp);
      if (entry.target.matches('[data-count]')) countUp(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  targets.forEach((el) => observer.observe(el));
}
