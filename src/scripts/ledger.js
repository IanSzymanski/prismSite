// Each figure in the sample draft points at its source; a wire is drawn between the two.
export function initLedger() {
  document.querySelectorAll('[data-ledger]').forEach((root) => {
    const figures = [...root.querySelectorAll('[data-fig]')];
    const sources = [...root.querySelectorAll('[data-src]')];
    const wire = root.querySelector('.ledger__wire');
    const path = wire && wire.querySelector('path');
    const dot = wire && wire.querySelector('circle');
    const gradient = wire && wire.querySelector('linearGradient');
    let current = '1';

    const draw = (animate) => {
      if (!wire) return;
      const figure = figures.find((f) => f.dataset.fig === current);
      const source = sources.find((s) => s.dataset.src === current);
      const box = root.getBoundingClientRect();
      const lines = figure.getClientRects();
      const from = lines[lines.length - 1];
      const to = source.getBoundingClientRect();
      const text = root.querySelector('.ledger__text').getBoundingClientRect();
      const x1 = from.left + from.width / 2 - box.left;
      const y1 = from.bottom - box.top + 3;
      const x2 = to.left - box.left;
      const y2 = to.top + to.height / 2 - box.top;
      // Route it down the gutter so it never crosses the text: under the paragraph, along the margin, into the row.
      const yg = text.bottom - box.top + 10;
      const gx = x2 - 16;
      const r = 10;
      path.setAttribute('d', `M${x1},${y1} L${x1},${yg - r} Q${x1},${yg} ${x1 - r},${yg} L${gx + r},${yg} Q${gx},${yg} ${gx},${yg + r} L${gx},${y2 - r} Q${gx},${y2} ${gx + r},${y2} L${x2},${y2}`);
      dot.setAttribute('cx', x2);
      dot.setAttribute('cy', y2);
      [['x1', x1], ['y1', y1], ['x2', x2], ['y2', y2]].forEach(([k, v]) => gradient.setAttribute(k, v));
      if (animate) { wire.classList.remove('is-drawn'); void wire.getBoundingClientRect(); }
      wire.classList.add('is-drawn');
    };

    const select = (id) => {
      if (id === current) return;
      current = id;
      figures.forEach((f) => f.setAttribute('aria-pressed', String(f.dataset.fig === id)));
      sources.forEach((s) => s.classList.toggle('is-on', s.dataset.src === id));
      // The chosen row slides a little; draw once it has settled.
      window.setTimeout(() => draw(true), 60);
    };

    figures.forEach((figure) => {
      figure.addEventListener('click', () => select(figure.dataset.fig));
      figure.addEventListener('focus', () => select(figure.dataset.fig));
      figure.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') select(figure.dataset.fig); });
    });

    if ('ResizeObserver' in window) new ResizeObserver(() => draw(false)).observe(root);
    if (document.fonts) document.fonts.ready.then(() => draw(false));
    draw(false);
  });
}
