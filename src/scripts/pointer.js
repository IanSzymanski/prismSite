import { motionOn } from './motion.js';

// Pointer-led touches: spotlights on cards, mocks that lean, buttons that pull, pipelines that replay.
export function initPointer() {
  const mouse = (event) => event.pointerType === 'mouse';

  document.addEventListener('pointermove', (event) => {
    if (!mouse(event)) return;
    const card = event.target.closest?.('.spot');
    if (!card) return;
    const box = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - box.left}px`);
    card.style.setProperty('--my', `${event.clientY - box.top}px`);
  }, { passive: true });

  document.querySelectorAll('[data-tilt-zone]').forEach((zone) => {
    const mock = zone.querySelector('[data-tilt]');
    if (!mock) return;
    zone.addEventListener('pointermove', (event) => {
      if (!mouse(event) || !motionOn()) return;
      const box = zone.getBoundingClientRect();
      const nx = (event.clientX - box.left) / box.width - 0.5;
      const ny = (event.clientY - box.top) / box.height - 0.5;
      mock.classList.add('is-tracking');
      mock.style.setProperty('--ry', `${(nx * 11).toFixed(2)}deg`);
      mock.style.setProperty('--rx', `${(-ny * 9).toFixed(2)}deg`);
    }, { passive: true });
    zone.addEventListener('pointerleave', () => {
      mock.classList.remove('is-tracking');
      mock.style.setProperty('--rx', '0deg');
      mock.style.setProperty('--ry', '0deg');
    });
  });

  document.querySelectorAll('[data-magnetic]').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      if (!mouse(event) || !motionOn()) return;
      const box = button.getBoundingClientRect();
      button.style.setProperty('--mag-x', `${((event.clientX - box.left - box.width / 2) * 0.2).toFixed(1)}px`);
      button.style.setProperty('--mag-y', `${((event.clientY - box.top - box.height / 2) * 0.3).toFixed(1)}px`);
    }, { passive: true });
    button.addEventListener('pointerleave', () => {
      button.style.setProperty('--mag-x', '0px');
      button.style.setProperty('--mag-y', '0px');
    });
  });

  document.querySelectorAll('[data-run]').forEach((card) => {
    const replay = () => {
      if (!motionOn() || !card.getAnimations) return;
      card.getAnimations({ subtree: true })
        .filter((a) => a.animationName && a.animationName.startsWith('pipe-'))
        .forEach((a) => { a.cancel(); a.play(); });
    };
    card.addEventListener('pointerenter', replay);
    card.addEventListener('focusin', replay);
  });
}
