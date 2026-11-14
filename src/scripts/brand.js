// The design-system picker. Presets restyle through CSS alone; "Yours" builds a system from four controls.
const PRESETS = {
  prism: { name: 'prism', accent: '#4650e6', display: 'Bricolage Grotesque', radius: '14px', ground: 'Light' },
  riverbend: { name: 'Riverbend', accent: '#2b6442', display: 'Instrument Serif', radius: '3px', ground: 'Light' },
  northline: { name: 'Northline', accent: '#ffb454', display: 'Mono, caps', radius: '0', ground: 'Dark' },
};
const TYPES = {
  sans: { label: 'Sans, bold', vars: { '--d-display': 'var(--font-display)', '--d-weight': '700', '--d-tracking': '-0.03em', '--d-case': 'none', '--d-scale': '1' } },
  serif: { label: 'Serif, bold', vars: { '--d-display': '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif', '--d-weight': '700', '--d-tracking': '-0.015em', '--d-case': 'none', '--d-scale': '0.96' } },
  mono: { label: 'Mono, caps', vars: { '--d-display': 'var(--font-mono)', '--d-weight': '500', '--d-tracking': '0', '--d-case': 'uppercase', '--d-scale': '0.74' } },
};
const CUSTOM_VARS = ['--d-bg', '--d-fg', '--d-muted', '--d-line', '--d-accent', '--d-on-accent', '--d-h1', '--d-h2', '--d-h3', '--d-h4', '--d-radius', ...Object.keys(TYPES.sans.vars)];

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function initBrand() {
  document.querySelectorAll('[data-brand]').forEach((root) => {
    const picks = [...root.querySelectorAll('input[name="brand"]')];
    const accent = root.querySelector('[data-tune-accent]');
    const radius = root.querySelector('[data-tune-radius]');
    const name = root.querySelector('[data-brand-name]');
    const read = (key) => root.querySelector(`[data-read="${key}"]`);
    if (!picks.length || !accent || !radius) return;

    const show = (key, value) => {
      const cell = read(key);
      const text = cell && cell.querySelector('span');
      if (!text || text.textContent === value) return;
      text.textContent = value;
      cell.classList.remove('is-flip');
      void cell.offsetWidth;
      cell.classList.add('is-flip');
    };

    const apply = () => {
      const choice = picks.find((p) => p.checked).value;
      if (choice !== 'custom') {
        CUSTOM_VARS.forEach((v) => root.style.removeProperty(v));
        const preset = PRESETS[choice];
        name.textContent = preset.name;
        show('accent', preset.accent); show('display', preset.display); show('radius', preset.radius); show('ground', preset.ground);
        return;
      }
      const color = accent.value;
      const type = TYPES[root.querySelector('input[name="tune-type"]:checked').value];
      const dark = root.querySelector('input[name="tune-ground"]:checked').value === 'dark';
      const fg = dark ? '#f4f5f9' : '#0e1016';
      const set = (k, v) => root.style.setProperty(k, v);
      set('--d-accent', color);
      set('--d-on-accent', luminance(color) > 0.4 ? '#0e1016' : '#ffffff');
      set('--d-bg', dark ? `color-mix(in srgb, ${color} 9%, #0d0f16)` : `color-mix(in srgb, ${color} 5%, #f9f9fb)`);
      set('--d-fg', fg);
      set('--d-muted', dark ? '#a3a9bb' : '#5b6070');
      set('--d-line', dark ? '#2b3040' : '#e0e2ea');
      set('--d-h1', color);
      set('--d-h2', `color-mix(in srgb, ${color} 70%, ${fg})`);
      set('--d-h3', `color-mix(in srgb, ${color} 45%, ${fg})`);
      set('--d-h4', `color-mix(in srgb, ${color} 25%, ${fg})`);
      set('--d-radius', `${radius.value}px`);
      Object.entries(type.vars).forEach(([k, v]) => set(k, v));
      name.textContent = 'yours';
      show('accent', color); show('display', type.label); show('radius', `${radius.value}px`); show('ground', dark ? 'Dark' : 'Light');
    };

    root.addEventListener('input', apply);
    root.addEventListener('change', apply);
    apply();
  });
}
