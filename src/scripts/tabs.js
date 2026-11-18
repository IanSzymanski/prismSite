// WAI-ARIA tabs with automatic activation: arrows move and select, Home and End jump. An ink block slides to the chosen tab.
export function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const list = root.querySelector('[role="tablist"]');
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

    const placeInk = () => {
      const tab = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
      if (!tab) return;
      const hue = (tab.className.match(/hue-(\d)/) || [])[1];
      list.style.setProperty('--x', `${tab.offsetLeft}px`);
      list.style.setProperty('--y', `${tab.offsetTop}px`);
      list.style.setProperty('--w', `${tab.offsetWidth}px`);
      list.style.setProperty('--h', `${tab.offsetHeight}px`);
      if (hue) list.style.setProperty('--ink-hue', `var(--hue-${hue})`);
    };

    const select = (index, focus) => {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      placeInk();
      if (focus) tabs[index].focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i, false));
      tab.addEventListener('keydown', (event) => {
        const last = tabs.length - 1;
        const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        select(next, true);
      });
    });

    // Place the ink when the list is laid out (and again when it resizes), not at startup: the section is far
    // below the fold and skips rendering until it comes near, so measuring it early would force a layout.
    if ('ResizeObserver' in window) new ResizeObserver(placeInk).observe(list); else placeInk();
  });
}
