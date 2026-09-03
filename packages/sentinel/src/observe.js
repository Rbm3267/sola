// DOM auto-wiring for a Sentinel.
//
// The observer itself is framework-agnostic, but until now using it meant
// hand-calling recordFieldFocus / recordFieldInput / recordFieldBlur on every
// field. That is the thing that made it feel like a Sola feature rather than a
// library: adopting it required editing every input. This attaches to a root
// element and derives the events by delegation, so wiring an existing form is
// one line and no markup changes.

import { createSentinel } from './sentinel.js';

/** Inputs whose contents must never enter the buffer. */
const SENSITIVE_TYPES = new Set(['password', 'hidden', 'file', 'credit-card']);
const SENSITIVE_AUTOCOMPLETE = /(^|\s)(cc-|one-time-code|current-password|new-password)/i;

const FIELD_SELECTOR = 'input, textarea, select';

/** A stable, human-readable name for a field, for the prompt to refer to. */
export function fieldNameOf(el) {
  const labelled = el.getAttribute('aria-label');
  if (labelled) return labelled;

  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => el.ownerDocument?.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');
    if (text) return text;
  }

  if (el.id) {
    const label = el.ownerDocument?.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    const text = label?.textContent?.trim();
    if (text) return text;
  }

  const wrapping = el.closest?.('label')?.textContent?.trim();
  if (wrapping) return wrapping;

  return el.name || el.id || el.getAttribute('placeholder') || el.tagName.toLowerCase();
}

/** True when a field's value must not be recorded. */
export function isSensitive(el) {
  if (el.type && SENSITIVE_TYPES.has(String(el.type).toLowerCase())) return true;
  const auto = `${el.getAttribute('autocomplete') ?? ''} ${el.autocomplete ?? ''}`;
  if (SENSITIVE_AUTOCOMPLETE.test(auto)) return true;
  return el.hasAttribute('data-sentinel-ignore') || !!el.closest?.('[data-sentinel-ignore]');
}

/**
 * Watch a subtree and feed its field activity to a Sentinel.
 *
 * @param {Element|Document}      root
 * @param {object}                [options]
 * @param {(prompt: string, sentinel: object) => void} [options.onSuggest]
 *   Called when the significance gate opens, with the prompt the Sentinel built.
 * @param {(fieldName: string, value: string, el: Element) => string} [options.redact]
 *   Rewrite a value before it is recorded. Return '' to record only its length.
 * @param {number}  [options.pollMs=250]  How often the gate is checked.
 * @param {string}  [options.name='observed']  Sentinel name.
 * @param {object}  [options.sentinel]  An existing Sentinel to feed, instead of a new one.
 * @returns {{ sentinel: object, disconnect: () => void }}
 */
export function observe(root, options = {}) {
  const {
    onSuggest,
    redact,
    pollMs = 250,
    name = 'observed',
    sentinel = createSentinel(name, options)
  } = options;

  if (!root || typeof root.addEventListener !== 'function') {
    // Nothing to watch (server render, detached node). Hand back a working
    // no-op so callers do not need to branch.
    return { sentinel, disconnect() {} };
  }

  const valueOf = (el) => {
    if (isSensitive(el)) return '';
    const raw = el.value ?? '';
    return typeof redact === 'function' ? redact(fieldNameOf(el), raw, el) : raw;
  };

  const matches = (el) => el && el.matches?.(FIELD_SELECTOR) && !isSensitive(el);

  const onFocusIn = (e) => {
    if (!matches(e.target)) return;
    sentinel.recordFieldFocus(fieldNameOf(e.target));
  };
  const onInput = (e) => {
    if (!matches(e.target)) return;
    sentinel.recordFieldInput(fieldNameOf(e.target), valueOf(e.target));
  };
  const onFocusOut = (e) => {
    if (!matches(e.target)) return;
    sentinel.recordFieldBlur(fieldNameOf(e.target), valueOf(e.target));
  };

  root.addEventListener('focusin', onFocusIn, true);
  root.addEventListener('input', onInput, true);
  root.addEventListener('focusout', onFocusOut, true);

  let timer = null;
  if (typeof onSuggest === 'function' && pollMs > 0) {
    timer = setInterval(() => {
      if (!sentinel.checkSignificance()) return;
      const prompt = sentinel.buildPrompt();
      if (prompt) onSuggest(prompt, sentinel);
    }, pollMs);
  }

  return {
    sentinel,
    disconnect() {
      root.removeEventListener('focusin', onFocusIn, true);
      root.removeEventListener('input', onInput, true);
      root.removeEventListener('focusout', onFocusOut, true);
      if (timer) clearInterval(timer);
      timer = null;
    }
  };
}
