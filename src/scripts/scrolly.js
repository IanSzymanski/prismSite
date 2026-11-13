import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionOn, onMotionChange } from './motion.js';

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
// The backdrop takes the colour of the step being told.
const GLOW = { rest: '#5b6cff', draft: '#ff5a70', proof: '#ffa53d', approve: '#2ed996', produce: '#5b84ff' };

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
      gsap.set(line.querySelector('.tok-bg'), { attr: { x: bb.x - 5, width: bb.width + 10 } });
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

function buildTimeline({ art, rail, auroras, wide }) {
  const scene = art.querySelector('.scene');
  const cameras = [scene, art.querySelector('.scene-glow')];
  const $ = (s) => scene.querySelector(s);
  const $$ = (s) => gsap.utils.toArray(scene.querySelectorAll(s));

  const srcs = $$('.src');
  const srcGlows = $$('.src-glow');
  const links = $$('.link');
  const flows = $$('.link-flow');
  const draft = $('#draft');
  const draftUnder = $('#draft-under');
  const sheet = [draft, draftUnder];
  const underOk = $('#draft-under-ok');
  const dTitle = $$('.d-title');
  const dBars = $$('.d-bar');
  const toks = $$('.tok');
  const tokBgs = $$('.tok-bg');
  const dSources = $$('.d-sources');
  const rule = $('#draft-rule');
  const scan = $('#scan');
  const seal = $('#seal');
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
  const btnUnder = $('#btn-under');
  const btnOn = $('#btn-on');
  const btnOk = $('#btn-ok');
  const btnLabelOff = $('#btn-label-off');
  const btnLabelOn = $('#btn-label-on');
  const btnDone = $('#btn-done');
  const ring = $('#press-ring');
  const hintA = $('#hint-a');
  const hintB = $('#hint-b');
  const cursor = $('#cursor');
  const feed = $('#feed');
  const prism = $('#prism');
  const halo = $('#prism-halo');
  const prismInner = $('#prism-inner');
  const rays = $$('.ray');
  const rayFlows = $('#ray-flows');
  const outs = $$('.out');
  const fills = gsap.utils.toArray(rail.querySelectorAll('.rail__fill'));

  const edit = layoutDraft(scene);
  const rayPts = rays.map((el) => {
    const p = el.getAttribute('points').trim().split(/\s+/);
    return { full: p.join(' '), shut: [p[0], p[1], p[1], p[0]].join(' ') };
  });

  // Opening frame: the raw material, loose on the desk.
  gsap.set(cameras, { attr: { viewBox: wide ? CAM.full : CAM.pile } });
  gsap.set(auroras, { color: GLOW.rest });
  srcs.forEach((el, i) => {
    gsap.set(el, { svgOrigin: '0 0', x: PILE[i].x, y: PILE[i].y, rotation: PILE[i].r, scale: 1, opacity: 1 });
    gsap.set(srcGlows[i], { svgOrigin: '0 0', x: PILE[i].x, y: PILE[i].y + 16, scale: 1, opacity: 1 });
  });
  gsap.set(links, { strokeDashoffset: 1, opacity: 1 });
  gsap.set(flows, { strokeDashoffset: 0, opacity: 0 });
  gsap.set(sheet, { svgOrigin: '0 0', x: DRAFT.x, y: DRAFT.y + 30, scale: 1, opacity: 0 });
  gsap.set(underOk, { opacity: 0 });
  gsap.set(dTitle, { opacity: 0, x: -10 });
  gsap.set(dBars, { scaleX: 0, transformOrigin: '0% 50%' });
  gsap.set([toks, tokBgs, wordOld, wordNew, wordNewBg, statusProof, statusOk], { opacity: 0 });
  gsap.set(dSources, { opacity: 0, y: 8 });
  gsap.set(rule, { scaleX: 0, transformOrigin: '0% 50%' });
  gsap.set(scan, { y: -90 });
  gsap.set(seal, { opacity: 0, scale: 0.2, rotation: -50, transformOrigin: '50% 50%' });
  gsap.set([flag, strike], { strokeDashoffset: 1, opacity: 1 });
  gsap.set([checks, approve], { opacity: 0, x: 30 });
  gsap.set($$('.check__fill, .check__flag'), { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
  gsap.set($$('.check__mark'), { strokeDashoffset: 1 });
  gsap.set([subFlag, subFixed, btnOn, btnOk, btnLabelOn, btnDone, hintB, btnUnder], { opacity: 0 });
  gsap.set(approveBtn, { scale: 1, transformOrigin: '50% 50%' });
  gsap.set(ring, { opacity: 0, attr: { r: 6 } });
  gsap.set(cursor, { svgOrigin: '0 0', x: 620, y: 540, opacity: 0 });
  gsap.set(feed, { strokeDashoffset: 1, opacity: 1 });
  gsap.set(prism, { opacity: 0, scale: 0.7, transformOrigin: '50% 50%' });
  gsap.set(halo, { opacity: 0, scale: 0.5, transformOrigin: '50% 50%' });
  gsap.set([prismInner, rayFlows], { opacity: 0 });
  rays.forEach((el, i) => gsap.set(el, { attr: { points: rayPts[i].shut } }));
  gsap.set(outs, { opacity: 0, x: 26 });
  gsap.set($$('.out__lit'), { opacity: 0 });
  gsap.set($$('.out__flash'), { opacity: 0, scale: 0.2, transformOrigin: '50% 50%' });
  gsap.set(fills, { scaleX: 0 });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  fills.forEach((el, i) => tl.to(el, { scaleX: 1, duration: 1, ease: 'none' }, i));

  // 1 Draft: sources line up, feed one draft, the draft writes itself.
  tl.to(auroras, { color: GLOW.draft, duration: 0.5, ease: 'none' }, 0.05);
  if (!wide) tl.to(cameras, { attr: { viewBox: CAM.draft }, duration: 0.5 }, 0);
  srcs.forEach((el, i) => {
    tl.to(el, { x: MINI.x, y: MINI.ys[i], rotation: 0, scale: MINI.scale, duration: 0.42 }, 0.02 + i * 0.03);
    tl.to(srcGlows[i], { x: MINI.x, y: MINI.ys[i], scale: MINI.scale, opacity: 0.7, duration: 0.42 }, 0.02 + i * 0.03);
  });
  tl.to(sheet, { opacity: 1, y: DRAFT.y, duration: 0.26, ease: 'power3.out' }, 0.3)
    .to(links, { strokeDashoffset: 0, duration: 0.2, stagger: 0.03, ease: 'power1.inOut' }, 0.44)
    .to(flows, { opacity: 1, duration: 0.06 }, 0.6)
    .to(flows, { strokeDashoffset: -99, duration: 0.75, ease: 'none' }, 0.56)
    .to(dTitle, { opacity: 1, x: 0, duration: 0.14, stagger: 0.05, ease: 'power2.out' }, 0.5)
    .to(dBars, { scaleX: 1, duration: 0.1, stagger: 0.02, ease: 'power1.out' }, 0.58)
    .to([toks, wordOld], { opacity: 1, duration: 0.08, stagger: 0.05 }, 0.7)
    .to(dSources, { opacity: 1, y: 0, duration: 0.12, stagger: 0.04, ease: 'power2.out' }, 0.82);

  // 2 Proof: a scan runs down the page, checks land, one word is flagged, you fix it.
  tl.to(auroras, { color: GLOW.proof, duration: 0.4, ease: 'none' }, 1.02);
  if (!wide) tl.to(cameras, { attr: { viewBox: CAM.proof }, duration: 0.32 }, 1);
  tl.to(checks, { opacity: 1, x: 0, duration: 0.2, ease: 'power3.out' }, 1.02)
    .to(approve, { opacity: 1, x: 0, duration: 0.2, ease: 'power3.out' }, 1.07)
    .to(statusProof, { opacity: 1, duration: 0.1 }, 1.1)
    .to([links, flows, srcGlows], { opacity: 0.4, duration: 0.2 }, 1.3)
    .to(scan, { y: 520, duration: 0.34, ease: 'none' }, 1.1)
    .to(tokBgs[0], { opacity: 1, duration: 0.05 }, 1.25)
    .to(tokBgs[1], { opacity: 1, duration: 0.05 }, 1.31)
    .to(ck('claims', 'fill'), { opacity: 1, scale: 1, duration: 0.08, ease: 'back.out(2.5)' }, 1.33)
    .to(ck('claims', 'mark'), { strokeDashoffset: 0, duration: 0.07 }, 1.36)
    .to(flag, { strokeDashoffset: 0, duration: 0.1 }, 1.29)
    .to(ck('voice', 'flag'), { opacity: 1, scale: 1, duration: 0.08, ease: 'back.out(2.5)' }, 1.4)
    .to(subFlag, { opacity: 1, duration: 0.06 }, 1.4)
    .to(cursor, { opacity: 1, duration: 0.06 }, 1.46)
    .to(cursor, { x: DRAFT.x + 74, y: DRAFT.y + 270, duration: 0.2 }, 1.46)
    .to(strike, { strokeDashoffset: 0, duration: 0.07 }, 1.66)
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
    .to([btnOn, btnLabelOn, btnUnder], { opacity: 1, duration: 0.07 }, 1.94)
    .to(btnLabelOff, { opacity: 0, duration: 0.07 }, 1.94);

  // 3 Approve: one press. The button goes green, the page is sealed.
  tl.to(auroras, { color: GLOW.approve, duration: 0.4, ease: 'none' }, 2.1)
    .to(cursor, { x: 648, y: 371, duration: 0.3 }, 2.08)
    .to(approveBtn, { scale: 0.95, duration: 0.05, ease: 'power1.in' }, 2.42)
    .to(ring, { opacity: 1, duration: 0.01 }, 2.45)
    .to(ring, { attr: { r: 34 }, duration: 0.18, ease: 'power1.out' }, 2.46)
    .to(ring, { opacity: 0, duration: 0.12, ease: 'power1.in' }, 2.52)
    .to(approveBtn, { scale: 1, duration: 0.12, ease: 'back.out(3.5)' }, 2.48)
    .to(btnOk, { opacity: 1, duration: 0.06 }, 2.49)
    .to(btnLabelOn, { opacity: 0, duration: 0.04 }, 2.49)
    .to(btnDone, { opacity: 1, duration: 0.06 }, 2.52)
    .to(hintA, { opacity: 0, duration: 0.04 }, 2.5)
    .to(hintB, { opacity: 1, duration: 0.06 }, 2.54)
    .to(statusProof, { opacity: 0, duration: 0.04 }, 2.5)
    .to(statusOk, { opacity: 1, duration: 0.06 }, 2.54)
    .to(rule, { scaleX: 1, duration: 0.22, ease: 'power2.out' }, 2.52)
    .to(underOk, { opacity: 1, duration: 0.2 }, 2.5)
    .to(seal, { opacity: 1, scale: 1, rotation: -10, duration: 0.16, ease: 'back.out(2.4)' }, 2.58)
    .to([srcs, srcGlows, links, flows], { opacity: 0, duration: 0.16 }, 2.74)
    .to(cursor, { opacity: 0, duration: 0.1 }, 2.82);

  // 4 Produce: the approved draft goes in as one beam; four formats come out.
  tl.to(auroras, { color: GLOW.produce, duration: 0.5, ease: 'none' }, 3.1);
  if (!wide) tl.to(cameras, { attr: { viewBox: CAM.produce }, duration: 0.42 }, 3);
  tl.to([checks, approve], { opacity: 0, x: 34, duration: 0.16, ease: 'power2.in' }, 3)
    .to(btnUnder, { opacity: 0, duration: 0.12 }, 3)
    .to(sheet, { x: DRAFT_MINI.x, y: DRAFT_MINI.y, scale: DRAFT_MINI.scale, duration: 0.38 }, 3.06)
    .to(underOk, { opacity: 0, duration: 0.3 }, 3.1)
    .to(halo, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, 3.24)
    .to(prism, { opacity: 1, scale: 1, duration: 0.22, ease: 'back.out(1.7)' }, 3.26)
    .to(feed, { strokeDashoffset: 0, duration: 0.1, ease: 'power1.in' }, 3.38)
    .to(prismInner, { opacity: 1, duration: 0.06 }, 3.46);
  if (!wide) tl.to([sheet, feed], { opacity: 0, duration: 0.12 }, 3.5);
  rays.forEach((el, i) => tl.to(el, { attr: { points: rayPts[i].full }, duration: 0.3, ease: 'power2.out' }, 3.48 + i * 0.04));
  outs.forEach((el, i) => {
    const at = 3.64 + i * 0.05;
    tl.to(el, { opacity: 1, x: 0, duration: 0.2, ease: 'power3.out' }, at)
      .to(el.querySelector('.out__flash'), { opacity: 1, scale: 1, duration: 0.08, ease: 'power2.out' }, at + 0.06)
      .to(el.querySelector('.out__flash'), { opacity: 0, scale: 1.5, duration: 0.2, ease: 'power1.out' }, at + 0.14)
      .to(el.querySelector('.out__lit'), { opacity: 1, duration: 0.12 }, at + 0.08);
  });
  tl.to(rayFlows, { opacity: 1, duration: 0.15 }, 3.84)
    .set({}, {}, 4);

  return tl;
}

export async function initScrolly() {
  const hero = document.querySelector('[data-scrolly]');
  if (!hero) return;
  const art = hero.querySelector('[data-art]');
  const scene = art.querySelector('.scene');
  const stage = hero.querySelector('[data-stage]');
  const rail = hero.querySelector('.rail');
  const stepsWrap = hero.querySelector('[data-steps]');
  const steps = [...hero.querySelectorAll('[data-step]')];
  const railLinks = [...hero.querySelectorAll('[data-step-link]')];
  const howLinks = [...document.querySelectorAll('a[href="#how"]')];
  const auroras = [...hero.querySelectorAll('[data-aurora]')];
  const pointerGlow = hero.querySelector('[data-hero-pointer]');
  const floats = gsap.utils.toArray(scene.querySelectorAll('.src__float'));
  const headerH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 76;

  await fontsReady();

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => hero.style.setProperty('--stage-h', `${stage.offsetHeight}px`)).observe(stage);
  }

  let mm;
  const setup = () => {
    mm = gsap.matchMedia();
    mm.add({ wide: '(min-width: 60em)', narrow: '(max-width: 59.99em)' }, (ctx) => {
      const { wide } = ctx.conditions;
      const reduce = !motionOn();
      art.classList.add('is-ready');
      rail.classList.add('is-live');
      stepsWrap.classList.add('is-live');

      const tl = buildTimeline({ art, rail, auroras, wide });
      let marks = [];
      let active = -1;
      let shown = -1;

      // For each step: a = scroll position where its transition starts, b = where it is done and the step reads.
      const measure = () => {
        const vh = window.innerHeight;
        const hh = headerH();
        const under = stage.offsetHeight + 4;
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
          gsap.to(art, { opacity: 0, duration: 0.12, overwrite: true, onComplete: () => { tl.time(idx); gsap.to(art, { opacity: 1, duration: 0.2 }); } });
          return;
        }
        if (instant) { gsap.killTweensOf(tl); tl.time(t); return; }
        gsap.to(tl, { time: t, duration: 0.6, ease: 'power2.out', overwrite: true });
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
        try { history.replaceState(null, '', link.hash); } catch { /* sandboxed frame */ }
      };
      const handlers = [
        ...railLinks.map((a, i) => [a, goTo(i, a)]),
        ...howLinks.map((a) => [a, goTo(0, a)]),
      ];
      handlers.forEach(([a, fn]) => a.addEventListener('click', fn));

      // Pointer: a soft light follows it across the backdrop, and the loose sources drift a little.
      let onMove;
      let onLeave;
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const enter = { opacity: 0, y: -40, scale: 0.9, transformOrigin: '50% 50%', duration: 1.1, ease: 'back.out(1.4)', stagger: 0.1, delay: 0.25 };
      if (!reduce && fine) {
        const gx = gsap.quickTo(pointerGlow, 'x', { duration: 0.9, ease: 'power3.out' });
        const gy = gsap.quickTo(pointerGlow, 'y', { duration: 0.9, ease: 'power3.out' });
        let drift = null;
        onMove = (e) => {
          gx(e.clientX); gy(e.clientY);
          gsap.to(pointerGlow, { opacity: 1, duration: 0.6, overwrite: 'auto' });
          if (!drift) return;
          const r = stage.getBoundingClientRect();
          const k = Math.max(0, 1 - tl.time() * 4);
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          drift.forEach((d) => { d.x(nx * d.depth * k); d.y(ny * d.depth * k); });
        };
        onLeave = () => gsap.to(pointerGlow, { opacity: 0, duration: 0.8, overwrite: 'auto' });
        hero.addEventListener('pointermove', onMove, { passive: true });
        hero.addEventListener('pointerleave', onLeave);
        const armDrift = () => {
          drift = floats.map((el, i) => ({
            x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3.out' }),
            y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3.out' }),
            depth: [22, -14, -16, 24][i],
          }));
        };
        if (tl.time() < 0.05) gsap.from(floats, { ...enter, rotation: (i) => [7, -6, -6, 7][i], onComplete: armDrift });
        else armDrift();
      } else if (!reduce && tl.time() < 0.05) {
        gsap.from(floats, enter);
      }

      return () => {
        handlers.forEach(([a, fn]) => a.removeEventListener('click', fn));
        if (onMove) hero.removeEventListener('pointermove', onMove);
        if (onLeave) hero.removeEventListener('pointerleave', onLeave);
        gsap.killTweensOf([tl, art, pointerGlow, ...floats]);
        gsap.set([...floats, pointerGlow, art], { clearProps: 'all' });
        art.classList.remove('is-ready');
        rail.classList.remove('is-live');
        stepsWrap.classList.remove('is-live');
      };
    });
  };

  setup();
  onMotionChange(() => { mm.revert(); setup(); });
}
