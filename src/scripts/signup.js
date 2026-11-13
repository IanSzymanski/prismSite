const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initSignup() {
  const form = document.querySelector('[data-signup]');
  if (!form) return;
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"]');
  const label = form.querySelector('[data-signup-label]');
  const icon = button.querySelector('use');
  const error = form.querySelector('.signup__error');
  const status = form.querySelector('.signup__status');
  const idle = label.textContent;

  const fail = (message, focus) => {
    error.querySelector('span').textContent = message;
    error.hidden = true;
    void error.offsetWidth; // restart the entrance
    error.hidden = false;
    error.setAttribute('role', 'alert');
    if (focus) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
  };
  const clear = () => { error.hidden = true; input.removeAttribute('aria-invalid'); };
  const busy = (on) => {
    button.setAttribute('aria-busy', String(on));
    button.disabled = on;
    label.textContent = on ? 'Sending' : idle;
    icon.setAttribute('href', on ? '#i-circle-notch' : '#i-arrow-right');
  };

  input.addEventListener('input', clear);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clear();
    const email = input.value.trim();
    if (!email) return fail('Enter your work email.', true);
    if (!EMAIL.test(email)) return fail('That email does not look right. Check it and try again.', true);

    busy(true);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      form.classList.add('is-done');
      status.querySelector('span').textContent = `Request sent. We will reply to ${email}.`;
      status.hidden = false;
      status.focus();
    } catch {
      fail('That did not send. Try again in a moment.', false);
    } finally {
      busy(false);
    }
    return undefined;
  });
}
