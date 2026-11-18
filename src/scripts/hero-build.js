// The hero's opening, in Prism's own order. CSS draws the words as a plain content.md (under :root[data-intro]).
// This script runs the brand check, brings a cursor in to fix the word it flags and approve the draft,
// then calls `style()`, which lays the design system over it. Every cue here is decorative and hidden from
// assistive tech: the real heading and links are in the page, unchanged, the whole time.

const STOP = Symbol('stop');
const CHECK = '<svg class="icon"><use href="#i-check"/></svg>';
const ARROW = '<svg viewBox="-2 -2 18 25"><path d="M0 0v17.5l4.6-4.1 3 6.8 3-1.3-2.9-6.6 5.9-.2z"/></svg>';
const KEYS = [64, 48, 72, 52, 66, 56, 60, 50];
const SCAN = 650;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const now = () => (document.timeline && document.timeline.currentTime !== null ? document.timeline.currentTime : performance.now());

function make(tag, className, html = '') {
  const el = document.createElement(tag);
  el.className = className;
  el.innerHTML = html;
  return el;
}

export function buildHero(hero, { style, abort }) {
  const skin = hero.querySelector('[data-skin]');
  const intro = skin.querySelector('.hero__intro');
  const title = skin.querySelector('.hero__title');
  const word = title.querySelector('.hero__was');
  const fix = title.querySelector('.hero__now').textContent.trim();
  const state = skin.querySelector('[data-file-state]');
  const approve = skin.querySelector('[data-file-approve]');
  const blocks = ['.pt-eyebrow', '.hero__title', '.hero__lede', '.hero__actions', '.hero__proof']
    .map((selector) => intro.querySelector(selector)).filter(Boolean);

  const layer = make('div', 'hero__review');
  layer.setAttribute('aria-hidden', 'true');
  const scan = make('i', 'hero__scan');
  const flag = make('p', 'hero__flag', '<b>Brand check</b><span></span>');
  const cursor = make('div', 'hero__cursor', `<i class="hero__ripple"></i>${ARROW}<span>You</span>`);
  const ripple = cursor.querySelector('.hero__ripple');
  layer.append(scan, flag, cursor);
  hero.append(layer);

  let stopped = false;
  const guard = () => { if (stopped) throw STOP; };
  const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, Math.max(0, ms)); }).then(guard);
  const later = (ms, fn) => setTimeout(() => { if (!stopped) fn(); }, Math.max(0, ms));

  // The words start drawing with the page, so cues are timed from the heading's own animation.
  const typing = title.getAnimations ? title.getAnimations().find((a) => a.animationName === 'raw-type') : null;
  const t0 = typing && typing.startTime !== null ? typing.startTime : now();
  const at = (ms) => wait(t0 + ms - now());

  // Geometry, read fresh at each step so it holds through resizes and late fonts.
  const frame = () => hero.getBoundingClientRect();
  const spot = (el, fx = 0.5, fy = 0.5) => {
    const h = frame();
    const r = el.getBoundingClientRect();
    return { x: r.left - h.left + r.width * fx, y: r.top - h.top + r.height * fy };
  };
  const firstLine = (el) => {
    const r = el.getBoundingClientRect();
    const line = parseFloat(getComputedStyle(el).lineHeight) || 24;
    return r.top - frame().top + Math.min(r.height, line) / 2;
  };

  const pop = (el, delay = 0) => el.animate(
    [{ opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1 }],
    { duration: 380, delay, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'backwards' },
  );
  const mark = (block, flagged, delay) => {
    const pad = parseFloat(getComputedStyle(intro).paddingLeft) || 30;
    const tick = make('span', flagged ? 'hero__tick is-flag' : 'hero__tick', flagged ? '!' : CHECK);
    tick.style.left = `${spot(intro, 0, 0).x + pad / 2 - 2}px`;
    tick.style.top = `${firstLine(block)}px`;
    layer.append(tick);
    pop(tick, delay);
    return tick;
  };
  const setState = (key, text) => { state.dataset.state = key; state.textContent = text; };

  const showFlag = () => {
    flag.lastChild.textContent = `Use “${fix}”, not “${word.textContent}”.`;
    const h = frame();
    const w = word.getBoundingClientRect();
    flag.style.left = `${Math.max(12, Math.min(w.left - h.left - 8, h.width - flag.offsetWidth - 12))}px`;
    flag.style.top = `${w.top - h.top - flag.offsetHeight - 12}px`;
    flag.animate([{ opacity: 0, translate: '0 8px' }, { opacity: 1, translate: '0 0' }], { duration: 360, easing: EASE, fill: 'forwards' });
  };

  // The cursor travels on a gentle arc, positioned with `translate` so a click can squash it with `scale`.
  let pos = { x: 0, y: 0 };
  const place = (p) => { pos = p; cursor.style.translate = `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`; };
  const glide = (to, duration, bend = 0.16) => {
    const from = pos;
    const cx = (from.x + to.x) / 2 + (to.y - from.y) * bend;
    const cy = (from.y + to.y) / 2 - (to.x - from.x) * bend;
    const frames = [];
    for (let i = 0; i <= 16; i += 1) {
      const t = i / 16;
      const u = 1 - t;
      frames.push({ translate: `${(u * u * from.x + 2 * u * t * cx + t * t * to.x).toFixed(1)}px ${(u * u * from.y + 2 * u * t * cy + t * t * to.y).toFixed(1)}px` });
    }
    const move = cursor.animate(frames, { duration, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' });
    place(to);
    return move.finished.catch(() => {});
  };
  const click = () => {
    cursor.animate([{ scale: 1 }, { scale: 0.84 }, { scale: 1 }], { duration: 170, easing: 'ease-out' });
    ripple.animate([{ opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 1.6 }], { duration: 520, easing: EASE });
    return wait(170);
  };

  async function run() {
    await at(1250);

    // Proof, part one: the brand and claim checks read the draft first. Every block passes but one.
    setState('check', 'Checking');
    const top = spot(blocks[0], 0, 0).y - 10;
    const bottom = spot(blocks[blocks.length - 1], 0, 1).y + 10;
    scan.style.left = `${spot(intro, 0, 0).x}px`;
    scan.style.width = `${intro.getBoundingClientRect().width}px`;
    scan.animate(
      [{ translate: `0 ${top}px`, opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1, offset: 0.9 }, { translate: `0 ${bottom}px`, opacity: 0 }],
      { duration: SCAN, easing: 'linear' },
    );
    let flagged = null;
    blocks.forEach((block) => {
      const delay = ((firstLine(block) - top) / (bottom - top)) * SCAN;
      const tick = mark(block, block === title, delay);
      if (block === title) {
        flagged = tick;
        later(delay, () => { word.classList.add('is-flagged'); showFlag(); });
      }
    });
    later(SCAN, () => setState('proof', 'In proof'));
    await wait(300);

    // Proof, part two: you read it and make the edit. The cursor comes in, selects the word and retypes it.
    const h = frame();
    place({ x: Math.min(h.width - 30, spot(intro, 1, 0).x + 80), y: Math.min(h.height - 40, spot(title, 0, 1).y + 170) });
    cursor.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, fill: 'forwards' });
    await glide(spot(word, 0.55, 0.62), 700);
    guard();
    await wait(60);
    await click();
    await wait(40);
    await click();
    word.classList.add('is-selected');
    await wait(240);
    word.classList.remove('is-selected', 'is-flagged');
    word.textContent = '';
    word.classList.add('is-typing');
    glide({ x: pos.x + 18, y: pos.y + 32 }, 420, 0);
    for (let i = 0; i < fix.length; i += 1) {
      await wait(KEYS[i % KEYS.length]);
      word.textContent += fix[i];
    }
    await wait(160);
    word.classList.remove('is-typing');
    flagged.classList.remove('is-flag');
    flagged.innerHTML = CHECK;
    pop(flagged);
    flag.classList.add('is-fixed');
    flag.lastChild.textContent = 'Fixed.';
    await wait(380);
    flag.animate([{ opacity: 1 }, { opacity: 0, translate: '0 -6px' }], { duration: 320, easing: EASE, fill: 'forwards' });

    // Approve: nothing is styled until the words are signed off.
    await glide(spot(approve, 0.4, 0.58), 600);
    guard();
    approve.classList.add('is-hot');
    await wait(80);
    await click();
    approve.classList.add('is-pressed');
    setState('approved', 'Approved');
    await wait(280);

    // Produce: the design system goes on, and the four outputs are made from the approved words.
    layer.classList.add('is-done');
    await style();
    layer.remove();
  }

  run().catch((error) => {
    if (error === STOP) return;
    console.error(error);
    abort();
  });

  return {
    cancel() {
      stopped = true;
      layer.remove();
      word.classList.remove('is-flagged', 'is-selected', 'is-typing');
    },
  };
}
