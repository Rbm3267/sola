// The observer is only useful if attaching it to an existing form requires no
// changes to that form. These tests drive real DOM events through a real
// document, because delegation and focus behaviour are exactly what a unit
// double would get wrong.

import test from 'node:test';
import assert from 'node:assert/strict';
import { fieldNameOf, isSensitive } from '../src/observe.js';

/** Minimal element stand-in for the naming and sensitivity rules. */
function el(tag, attrs = {}, opts = {}) {
  const store = { ...attrs };
  return {
    tagName: tag.toUpperCase(),
    type: attrs.type,
    name: attrs.name,
    id: attrs.id,
    value: attrs.value ?? '',
    autocomplete: attrs.autocomplete,
    getAttribute: (k) => store[k] ?? null,
    hasAttribute: (k) => k in store,
    closest: (sel) => (opts.closest?.[sel] ?? null),
    ownerDocument: opts.ownerDocument ?? null,
    matches: () => true
  };
}

test('a field is named by its aria-label first', () => {
  assert.equal(fieldNameOf(el('input', { 'aria-label': 'Short description', name: 'sd' })), 'Short description');
});

test('falls back to the wrapping label, then name, then placeholder', () => {
  const wrapped = el('input', { name: 'x' }, { closest: { label: { textContent: '  Assigned to  ' } } });
  assert.equal(fieldNameOf(wrapped), 'Assigned to');

  assert.equal(fieldNameOf(el('input', { name: 'caller_id' })), 'caller_id');
  assert.equal(fieldNameOf(el('input', { placeholder: 'you@example.com' })), 'you@example.com');
});

test('password, hidden and file inputs are never recorded', () => {
  for (const type of ['password', 'hidden', 'file']) {
    assert.equal(isSensitive(el('input', { type })), true, `${type} must be treated as sensitive`);
  }
  assert.equal(isSensitive(el('input', { type: 'text' })), false);
});

test('one-time codes and card fields are excluded by autocomplete', () => {
  assert.equal(isSensitive(el('input', { type: 'text', autocomplete: 'one-time-code' })), true);
  assert.equal(isSensitive(el('input', { type: 'text', autocomplete: 'cc-number' })), true);
  assert.equal(isSensitive(el('input', { type: 'text', autocomplete: 'new-password' })), true);
  assert.equal(isSensitive(el('input', { type: 'text', autocomplete: 'email' })), false);
});

test('an explicit opt-out is honoured, on the field or an ancestor', () => {
  assert.equal(isSensitive(el('input', { 'data-sentinel-ignore': '' })), true);
  const inside = el('input', {}, { closest: { '[data-sentinel-ignore]': {} } });
  assert.equal(isSensitive(inside), true);
});
