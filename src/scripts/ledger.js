// Each figure in the sample draft points at its source.
export function initLedger() {
  document.querySelectorAll('[data-ledger]').forEach((root) => {
    const figures = [...root.querySelectorAll('[data-fig]')];
    const sources = [...root.querySelectorAll('[data-src]')];
    const select = (id) => {
      figures.forEach((f) => f.setAttribute('aria-pressed', String(f.dataset.fig === id)));
      sources.forEach((s) => s.classList.toggle('is-on', s.dataset.src === id));
    };
    figures.forEach((figure) => {
      figure.addEventListener('click', () => select(figure.dataset.fig));
      figure.addEventListener('focus', () => select(figure.dataset.fig));
      figure.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') select(figure.dataset.fig); });
    });
  });
}
