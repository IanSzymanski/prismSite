import { motionOn } from './motion.js';

// The hero shows the same content in five sample design systems. It moves to the next one on a timer,
// or when one is picked. The next system is laid over the current one and wiped in along a diagonal.
const ORDER = ['prism', 'riverbend', 'northline', 'kiln', 'halcyon'];
const TONE = { prism: 'dark', riverbend: 'light', northline: 'dark', kiln: 'light', halcyon: 'light' };
const FONTS = {
  riverbend: ['400 48px "Instrument Serif"', 'italic 400 48px "Instrument Serif"'],
  kiln: ['400 48px "Anton"'],
};
const DWELL = 4800;
const WIPE = 1150;
const START = 'polygon(0% 0%, 0% 0%, -24% 100%, 0% 100%)';
const END = 'polygon(0% 0%, 124% 0%, 100% 100%, 0% 100%)';

export function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const skin = hero.querySelector('[data-skin]');
  const edge = hero.querySelector('.hero__edge');
  const edgeLine = edge.querySelector('i');
  const buttons = [...hero.querySelectorAll('[data-sys-btn]')];
  const pauseButton = hero.querySelector('[data-sys-pause]');
  const switcher = hero.querySelector('.sys');
  const born = performance.now();

  let current = skin.dataset.sys;
  let busy = false;
  let paused = false;
  let hovering = false;
  let visible = true;
  let elapsed = 0;
  let last = performance.now();
  let frame = 0;

  const loadFonts = (sys) => {
    const list = FONTS[sys];
    if (!list || !document.fonts) return Promise.resolve();
    return Promise.race([
      Promise.all(list.map((font) => document.fonts.load(font))).catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  };
  const warm = () => ORDER.forEach(loadFonts);
  if ('requestIdleCallback' in window) window.requestIdleCallback(warm, { timeout: 2000 }); else setTimeout(warm, 1200);

  const mark = (sys) => buttons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.sysBtn === sys));
    button.style.setProperty('--p', '0');
  });
  // The header reads its ink from the section under it, so tell it when the ground flips.
  const setTone = (sys) => {
    hero.dataset.headerTone = TONE[sys];
    document.dispatchEvent(new CustomEvent('prism:tone'));
  };
  const settle = (sys) => { skin.dataset.sys = sys; current = sys; };
  // How long the skin's own animations have been running, read from one of them so the copy lines up exactly.
  const age = () => {
    const card = skin.querySelector('.hx__card');
    const running = card && card.getAnimations ? card.getAnimations().find((a) => a.animationName === 'hx-float') : null;
    if (running && running.startTime !== null && document.timeline) return (document.timeline.currentTime - running.startTime) / 1000;
    return (performance.now() - born) / 1000;
  };

  async function show(sys) {
    if (busy || sys === current || !ORDER.includes(sys)) return;
    busy = true;
    elapsed = 0;
    mark(sys);
    await loadFonts(sys);
    if (!motionOn() || !skin.animate) { settle(sys); setTone(sys); busy = false; return; }

    const next = skin.cloneNode(true);
    next.classList.add('is-next');
    next.dataset.sys = sys;
    next.removeAttribute('data-skin');
    next.setAttribute('aria-hidden', 'true');
    next.inert = true;
    next.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    // Start the copy's animations as if it had been here all along, so nothing replays or jumps.
    next.style.setProperty('--age', `${age().toFixed(3)}s`);
    next.style.clipPath = START;
    hero.insertBefore(next, edge);

    const timing = { duration: WIPE, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', fill: 'forwards' };
    const wipe = next.animate({ clipPath: [START, END] }, timing);
    edgeLine.animate({
      clipPath: ['polygon(0% 0%, 0.45% 0%, -23.55% 100%, -24% 100%)', 'polygon(124% 0%, 124.45% 0%, 100.45% 100%, 100% 100%)'],
    }, timing);
    edge.animate({ opacity: [0, 1, 1, 0], offset: [0, 0.08, 0.9, 1] }, { duration: WIPE, easing: 'linear' });
    window.setTimeout(() => setTone(sys), WIPE * 0.42);
    try { await wipe.finished; } catch { /* cancelled */ }
    settle(sys);
    next.remove();
    busy = false;
  }

  const canRun = () => motionOn() && !paused && !hovering && visible && !document.hidden && !busy;
  const tick = (now) => {
    frame = requestAnimationFrame(tick);
    const delta = Math.min(100, now - last);
    last = now;
    if (!canRun()) return;
    elapsed += delta;
    const active = buttons.find((button) => button.dataset.sysBtn === current);
    if (active) active.style.setProperty('--p', Math.min(1, elapsed / DWELL).toFixed(3));
    if (elapsed >= DWELL) show(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
  };
  const start = () => { if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick); } };
  const stop = () => { cancelAnimationFrame(frame); frame = 0; };

  buttons.forEach((button) => button.addEventListener('click', () => show(button.dataset.sysBtn)));
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
  });
  switcher.addEventListener('pointerenter', () => { hovering = true; });
  switcher.addEventListener('pointerleave', () => { hovering = false; });
  switcher.addEventListener('focusin', () => { hovering = true; });
  switcher.addEventListener('focusout', (event) => { if (!switcher.contains(event.relatedTarget)) hovering = false; });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio > 0.3;
      if (visible) start(); else stop();
    }, { threshold: [0, 0.3, 0.6] }).observe(hero);
  }
  start();

  // The four outputs lean a little with the pointer.
  let queued = false;
  let px = 0;
  let py = 0;
  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || !motionOn()) return;
    const box = hero.getBoundingClientRect();
    px = ((event.clientX - box.left) / box.width - 0.5) * 2;
    py = ((event.clientY - box.top) / box.height - 0.5) * 2;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      hero.style.setProperty('--px', px.toFixed(3));
      hero.style.setProperty('--py', py.toFixed(3));
    });
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--px', '0');
    hero.style.setProperty('--py', '0');
  });
}
