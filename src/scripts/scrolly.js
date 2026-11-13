import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Scene geometry, in viewBox units (720 x 600).
const PILE = [
  { x: 258, y: 196, r: -7 },
  { x: 462, y: 166, r: 5 },
  { x: 268, y: 408, r: 4 },
  { x: 486, y: 424, r: -5 },
];
const MINI = { x: 56, ys: [180, 256, 332, 408], scale: 0.32 };
const DRAFT = { x: 150, y: 44 };
const DRAFT_MINI = { x: 20, y: 213, scale: 0.34 };
const LINE_RIGHT = 280;
const CAM = {
  full: '0 0 720 600',
  pile: '112 49 500 500',
  draft: '-35 30 540 540',
  proof: '135 10 580 580',
  produce: '140 18 565 565',
};

const fontsReady = () => {
  if (!document.fonts) return Promise.resolve();
  const wait = Promise.all([
    document.fonts.load('600 14px "IBM Plex Sans"'),
    document.fonts.load('500 14px "IBM Plex Sans"'),
    document.fonts.load('700 24px "Bricolage Grotesque"'),
    document.fonts.ready,
  ]).catch(() => {});
  return Promise.race([wait, new Promise((r) => setTimeout(r, 1500))]);
};

// Fit the tint boxes and trailing bars to the measured words, whatever font rendered.
function layoutDraft(scene) {
  const edit = { oldX: 134, newX: 110 };
  scene.querySelectorAll('.d-line').forEach((line) => {
    const tok = line.querySelector('.tok');
    const after = line.querySelector('.d-after');
    if (tok) {
      const bb = tok.getBBox();
      const bg = line.querySelector('.tok-bg');
      gsap.set(bg, { attr: { x: bb.x - 5, width: bb.width + 10 } });
      const x = bb.x + bb.width + 10;
      gsap.set(after, { attr: { x, width: Math.max(8, LINE_RIGHT - x) } });
      return;
    }
    const oldBB = line.querySelector('#word-old').getBBox();
    const newBB = line.querySelector('#word-new').getBBox();
    gsap.set(line.querySelector('#word-new-bg'), { attr: { x: newBB.x - 5, width: newBB.width + 10 } });
    gsap.set(line.querySelector('#word-strike'), { attr: { d: `M${oldBB.x - 3},264 H${oldBB.x + oldBB.width + 3}` } });
    const n = Math.max(4, Math.round(oldBB.width / 7.4));
    const seg = oldBB.width / n;
    let d = `M${oldBB.x},273.5 q${seg / 2},-3.4 ${seg},0`;
    for (let i = 1; i < n; i += 1) d += ` t${seg},0`;
    gsap.set(line.querySelector('#word-flag'), { attr: { d } });
    edit.oldX = oldBB.x + oldBB.width + 9;
    edit.newX = newBB.x + newBB.width + 13;
    gsap.set(after, { attr: { x: edit.oldX, width: LINE_RIGHT - edit.oldX } });
  });
  return edit;
}

function buildTimeline(scene, rail, { wide }) {
  const $ = (s) => scene.querySelector(s);
  const $$ = (s) => gsap.utils.toArray(scene.querySelectorAll(s));

  const srcs = $$('.src');
  const links = $$('.link');
  const dots = $$('.link-dot');
  const draft = $('#draft');
  const dTitle = $$('.d-title');
  const dBars = $$('.d-bar');
  const toks = $$('.tok');
  const tokBgs = $$('.tok-bg');
  const dSources = $$('.d-sources');
  const rule = $('#draft-rule');
  const statusProof = $('#status-proof');
  const statusOk = $('#status-ok');
  const wordOld = $('#word-old');
  const wordNew = $('#word-new');
  const wordNewBg = $('#word-new-bg');
  const flag = $('#word-flag');
  const strike = $('#word-strike');
  const editAfter = $('#edit-after');
  const checks = $('#checks');
  const ck = (name, part) => $(`[data-check="${name}"] .check__${part}`);
  const subFlag = $('#sub-flag');
  const subFixed = $('#sub-fixed');
  const approve = $('#approve');
  const approveBtn = $('#approve-btn');
  const btnOn = $('#btn-on');
  const btnLabelOff = $('#btn-label-off');
  const btnLabelOn = $('#btn-label-on');
  const btnDone = $('#btn-done');
  const ring = $('#press-ring');
  const hintA = $('#hint-a');
  const hintB = $('#hint-b');
  const cursor = $('#cursor');
  const feed = $('#feed');
  const prism = $('#prism');
  const rays = $$('.ray');
  const outs = $$('.out');
  const fills = gsap.utils.toArray(rail.querySelectorAll('.rail__fill'));

  const edit = layoutDraft(scene);
  const rayPts = rays.map((el) => {
    const p = el.getAttribute('points').trim().split(/\s+/);
    return { full: p.join(' '), shut: [p[0], p[1], p[1], p[0]].join(' ') };
  });

  // Opening frame: the raw material, loose on the desk.
  gsap.set(scene, { attr: { viewBox: wide ? CAM.full : CAM.pile } });
  srcs.forEach((el, i) => gsap.set(el, { svgOrigin: '0 0', x: PILE[i].x, y: PILE[i].y, rotation: PILE[i].r, scale: 1, opacity: 1 }));
  gsap.set(links, { strokeDashoffset: 1, opacity: 1 });
  gsap.set(dots, { opacity: 0 });
  gsap.set(draft, { svgOrigin: '0 0', x: DRAFT.x, y: DRAFT.y + 26, scale: 1, opacity: 0 });
  gsap.set(dTitle, { opacity: 0, x: -10 });
  gsap.set(dBars, { scaleX: 0, transformOrigin: '0% 50%' });
  gsap.set([toks, tokBgs, wordOld, wordNew, wordNewBg, statusProof, statusOk], { opacity: 0 });
  gsap.set(dSources, { opacity: 0, y: 8 });
  gsap.set(rule, { scaleX: 0, transformOrigin: '0% 50%' });
  gsap.set([flag, strike], { strokeDashoffset: 1, opacity: 1 });
  gsap.set([checks, approve], { opacity: 0, x: 26 });
  gsap.set($$('.check__fill, .check__flag'), { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
  gsap.set($$('.check__mark'), { strokeDashoffset: 1 });
  gsap.set([subFlag, subFixed, btnOn, btnLabelOn, btnDone, hintB], { opacity: 0 });
  gsap.set(approveBtn, { scale: 1, transformOrigin: '50% 50%' });
  gsap.set(ring, { opacity: 0, attr: { r: 6 } });
  gsap.set(cursor, { svgOrigin: '0 0', x: 620, y: 540, opacity: 0 });
  gsap.set(feed, { strokeDashoffset: 1, opacity: 1 });
  gsap.set(prism, { opacity: 0, scale: 0.7, transformOrigin: '50% 50%' });
  rays.forEach((el, i) => gsap.set(el, { attr: { points: rayPts[i].shut } }));
  gsap.set(outs, { opacity: 0, x: 22 });
  gsap.set(fills, { scaleX: 0 });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  fills.forEach((el, i) => tl.to(el, { scaleX: 1, duration: 1, ease: 'none' }, i));

  // 1 Draft: sources line up, feed one draft, the draft writes itself.
  if (!wide) tl.to(scene, { attr: { viewBox: CAM.draft }, duration: 0.5 }, 0);
  srcs.forEach((el, i) => tl.to(el, { x: MINI.x, y: MINI.ys[i], rotation: 0, scale: MINI.scale, duration: 0.42 }, 0.02 + i * 0.03));
  tl.to(draft, { opacity: 1, y: DRAFT.y, duration: 0.24, ease: 'power2.out' }, 0.3)
    .to(links, { strokeDashoffset: 0, duration: 0.2, stagger: 0.03, ease: 'power1.inOut' }, 0.44)
    .to(dots, { opacity: 1, duration: 0.05, stagger: 0.03 }, 0.62)
    .to(dTitle, { opacity: 1, x: 0, duration: 0.14, stagger: 0.05, ease: 'power2.out' }, 0.5)
    .to(dBars, { scaleX: 1, duration: 0.1, stagger: 0.02, ease: 'power1.out' }, 0.58)
    .to([toks, wordOld], { opacity: 1, duration: 0.08, stagger: 0.05 }, 0.7)
    .to(dSources, { opacity: 1, y: 0, duration: 0.12, stagger: 0.04, ease: 'power2.out' }, 0.82);

  // 2 Proof: checks run, one word is flagged, you fix it.
  if (!wide) tl.to(scene, { attr: { viewBox: CAM.proof }, duration: 0.32 }, 1);
  tl.to(checks, { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' }, 1.02)
    .to(approve, { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' }, 1.07)
    .to(statusProof, { opacity: 1, duration: 0.1 }, 1.1)
    .to([links, dots], { opacity: 0.45, duration: 0.2 }, 1.05)
    .to(tokBgs, { opacity: 1, duration: 0.08, stagger: 0.05 }, 1.2)
    .to(ck('claims', 'fill'), { opacity: 1, scale: 1, duration: 0.08, ease: 'back.out(2.5)' }, 1.26)
    .to(ck('claims', 'mark'), { strokeDashoffset: 0, duration: 0.07 }, 1.3)
    .to(ck('voice', 'flag'), { opacity: 1, scale: 1, duration: 0.08, ease: 'back.out(2.5)' }, 1.38)
    .to(subFlag, { opacity: 1, duration: 0.06 }, 1.38)
    .to(flag, { strokeDashoffset: 0, duration: 0.12 }, 1.4)
    .to(cursor, { opacity: 1, duration: 0.06 }, 1.44)
    .to(cursor, { x: DRAFT.x + 74, y: DRAFT.y + 270, duration: 0.2 }, 1.44)
    .to(strike, { strokeDashoffset: 0, duration: 0.07 }, 1.65)
    .to([wordOld, strike, flag], { opacity: 0, duration: 0.05 }, 1.73)
    .to([wordNewBg, wordNew], { opacity: 1, duration: 0.06 }, 1.75)
    .to(editAfter, { attr: { x: edit.newX, width: LINE_RIGHT - edit.newX }, duration: 0.08 }, 1.75)
    .to(ck('voice', 'flag'), { opacity: 0, duration: 0.04 }, 1.81)
    .to(subFlag, { opacity: 0, duration: 0.04 }, 1.81)
    .to(ck('voice', 'fill'), { opacity: 1, scale: 1, duration: 0.08, ease: 'back.out(2.5)' }, 1.82)
    .to(ck('voice', 'mark'), { strokeDashoffset: 0, duration: 0.07 }, 1.85)
    .to(subFixed, { opacity: 1, duration: 0.05 }, 1.84)
    .to(ck('sample', 'fill'), { opacity: 1, scale: 1, duration: 0.08, ease: 'back.out(2.5)' }, 1.89)
    .to(ck('sample', 'mark'), { strokeDashoffset: 0, duration: 0.07 }, 1.92)
    .to([btnOn, btnLabelOn], { opacity: 1, duration: 0.07 }, 1.94)
    .to(btnLabelOff, { opacity: 0, duration: 0.07 }, 1.94);

  // 3 Approve: one press, the words are settled.
  tl.to(cursor, { x: 648, y: 371, duration: 0.3 }, 2.08)
    .to(approveBtn, { scale: 0.96, duration: 0.05, ease: 'power1.in' }, 2.42)
    .to(ring, { opacity: 1, duration: 0.01 }, 2.45)
    .to(ring, { attr: { r: 30 }, duration: 0.16, ease: 'power1.out' }, 2.46)
    .to(ring, { opacity: 0, duration: 0.12, ease: 'power1.in' }, 2.5)
    .to(approveBtn, { scale: 1, duration: 0.1, ease: 'back.out(3)' }, 2.48)
    .to(btnLabelOn, { opacity: 0, duration: 0.04 }, 2.49)
    .to(btnDone, { opacity: 1, duration: 0.06 }, 2.52)
    .to(hintA, { opacity: 0, duration: 0.04 }, 2.5)
    .to(hintB, { opacity: 1, duration: 0.06 }, 2.54)
    .to(statusProof, { opacity: 0, duration: 0.04 }, 2.5)
    .to(statusOk, { opacity: 1, duration: 0.06 }, 2.54)
    .to(rule, { scaleX: 1, duration: 0.22, ease: 'power2.out' }, 2.52)
    .to([srcs, links, dots], { opacity: 0, duration: 0.16 }, 2.72)
    .to(cursor, { opacity: 0, duration: 0.1 }, 2.82);

  // 4 Produce: the approved draft enters the prism; four formats leave it.
  if (!wide) tl.to(scene, { attr: { viewBox: CAM.produce }, duration: 0.42 }, 3);
  tl.to([checks, approve], { opacity: 0, x: 30, duration: 0.16, ease: 'power2.in' }, 3)
    .to(draft, { x: DRAFT_MINI.x, y: DRAFT_MINI.y, scale: DRAFT_MINI.scale, duration: 0.38 }, 3.06)
    .to(prism, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(1.6)' }, 3.28)
    .to(feed, { strokeDashoffset: 0, duration: 0.12 }, 3.4);
  if (!wide) tl.to([draft, feed], { opacity: 0, duration: 0.12 }, 3.34);
  rays.forEach((el, i) => tl.to(el, { attr: { points: rayPts[i].full }, duration: 0.3, ease: 'power2.out' }, 3.47 + i * 0.04));
  tl.to(outs, { opacity: 1, x: 0, duration: 0.2, stagger: 0.05, ease: 'power2.out' }, 3.62)
    .set({}, {}, 4);

  return tl;
}

export async function initScrolly() {
  const hero = document.querySelector('[data-scrolly]');
  if (!hero) return;
  const scene = hero.querySelector('.scene');
  const stage = hero.querySelector('[data-stage]');
  const rail = hero.querySelector('.rail');
  const stepsWrap = hero.querySelector('[data-steps]');
  const steps = [...hero.querySelectorAll('[data-step]')];
  const railLinks = [...hero.querySelectorAll('[data-step-link]')];
  const howLinks = [...document.querySelectorAll('a[href="#how"]')];
  const floats = gsap.utils.toArray(scene.querySelectorAll('.src__float'));
  const headerH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 60;

  await fontsReady();

  const sizeStage = new ResizeObserver(() => hero.style.setProperty('--stage-h', `${stage.offsetHeight}px`));
  sizeStage.observe(stage);

  const mm = gsap.matchMedia();
  mm.add({ wide: '(min-width: 60em)', narrow: '(max-width: 59.99em)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
    const { wide, reduce } = ctx.conditions;
    scene.classList.add('is-ready');
    rail.classList.add('is-live');
    stepsWrap.classList.add('is-live');

    const tl = buildTimeline(scene, rail, { wide });
    let marks = [];
    let active = -1;
    let shown = -1;

    // For each step: a = scroll position where its transition starts, b = where it is done and the step reads.
    const measure = () => {
      const vh = window.innerHeight;
      const hh = headerH();
      const under = hh + stage.offsetHeight + 20;
      marks = steps.map((step) => {
        const r = step.querySelector('.step__body').getBoundingClientRect();
        const top = r.top + window.scrollY;
        return { b: Math.max(1, wide ? top + r.height / 2 - (hh + (vh - hh) / 2) : top - under) };
      });
      marks.forEach((m, i) => { m.a = Math.max(m.b - vh * 0.6, i ? marks[i - 1].b + vh * 0.08 : 0); });
    };

    const timeAt = (y) => {
      let t = 0;
      for (let i = 0; i < marks.length; i += 1) {
        const { a, b } = marks[i];
        if (y >= b) { t = i + 1; continue; }
        if (y > a) t = i + (y - a) / (b - a);
        break;
      }
      return t;
    };

    const setActive = (idx) => {
      if (idx === active) return;
      active = idx;
      railLinks.forEach((a, i) => (i === idx - 1 ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current')));
      steps.forEach((s, i) => s.classList.toggle('is-active', i < idx));
    };

    const update = (instant) => {
      const t = timeAt(window.scrollY);
      setActive(t < 0.02 ? 0 : Math.min(steps.length, Math.ceil(t - 1e-4)));
      if (reduce) {
        // No movement: each step swaps in whole, with a short fade.
        const idx = Math.floor(t + 0.5);
        if (idx === shown) return;
        const first = shown === -1;
        shown = idx;
        if (first || instant) { tl.time(idx); return; }
        gsap.to(scene, { opacity: 0, duration: 0.12, overwrite: true, onComplete: () => { tl.time(idx); gsap.to(scene, { opacity: 1, duration: 0.2 }); } });
        return;
      }
      if (instant) { gsap.killTweensOf(tl); tl.time(t); return; }
      gsap.to(tl, { time: t, duration: 0.55, ease: 'power2.out', overwrite: true });
    };

    ScrollTrigger.create({
      trigger: hero,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: () => update(false),
      onRefresh: () => { measure(); update(true); },
    });
    measure();
    update(true);

    const goTo = (i, link) => (event) => {
      event.preventDefault();
      window.scrollTo({ top: marks[i].b + 2, behavior: reduce ? 'auto' : 'smooth' });
      steps[i].focus({ preventScroll: true });
      history.replaceState(null, '', link.hash);
    };
    const handlers = [
      ...railLinks.map((a, i) => [a, goTo(i, a)]),
      ...howLinks.map((a) => [a, goTo(0, a)]),
    ];
    handlers.forEach(([a, fn]) => a.addEventListener('click', fn));

    // Entrance and pointer drift for the loose sources. Both stop once the story starts.
    let onMove;
    if (!reduce && tl.time() < 0.05) {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      gsap.from(floats, {
        opacity: 0, y: -28, scale: 0.94, rotation: (i) => [5, -4, -4, 5][i], transformOrigin: '50% 50%',
        duration: 0.9, ease: 'back.out(1.5)', stagger: 0.09, delay: 0.15,
        onComplete: () => {
          if (!fine) return;
          const drift = floats.map((el, i) => ({
            x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }),
            y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' }),
            depth: [16, -11, -13, 18][i],
          }));
          onMove = (e) => {
            const r = stage.getBoundingClientRect();
            const k = Math.max(0, 1 - tl.time() * 4);
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            drift.forEach((d) => { d.x(nx * d.depth * k); d.y(ny * d.depth * k); });
          };
          hero.addEventListener('pointermove', onMove, { passive: true });
        },
      });
    }

    return () => {
      handlers.forEach(([a, fn]) => a.removeEventListener('click', fn));
      if (onMove) hero.removeEventListener('pointermove', onMove);
      gsap.killTweensOf([tl, ...floats]);
      gsap.set(floats, { clearProps: 'all' });
      scene.classList.remove('is-ready');
      rail.classList.remove('is-live');
      stepsWrap.classList.remove('is-live');
    };
  });
}
