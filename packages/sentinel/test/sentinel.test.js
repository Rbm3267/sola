import test from 'node:test';
import assert from 'node:assert/strict';
import { SolaSentinel, createSentinel } from '../src/index.js';

test('recordClick still triggers rage-click friction alerts', () => {
  const sentinel = createSentinel('test');
  let fired = null;
  sentinel.onFriction((event) => { fired = event; });

  const realNow = Date.now;
  let t = 1000;
  Date.now = () => t;
  try {
    sentinel.recordClick('submit-btn');
    t += 100;
    sentinel.recordClick('submit-btn');
    t += 100;
    sentinel.recordClick('submit-btn');
  } finally {
    Date.now = realNow;
  }

  assert.equal(fired.type, 'RAGE_CLICK');
  assert.equal(fired.count, 3);
});

test('recordFieldFocus caps the buffer at 50 events', () => {
  const sentinel = new SolaSentinel('test');
  for (let i = 0; i < 80; i++) {
    sentinel.recordFieldFocus(`field-${i}`, i * 10);
  }
  assert.equal(sentinel.fieldHistory.length, 50);
  assert.equal(sentinel.fieldHistory[0].fieldId, 'field-30');
  assert.equal(sentinel.fieldHistory.at(-1).fieldId, 'field-79');
});

test('recordFieldFocus evicts events older than the 60s window', () => {
  const sentinel = new SolaSentinel('test');
  sentinel.recordFieldFocus('old-field', 0);
  sentinel.recordFieldFocus('new-field', 61_000);
  assert.equal(sentinel.fieldHistory.length, 1);
  assert.equal(sentinel.fieldHistory[0].fieldId, 'new-field');
});

test('recordFieldFocus marks revisit only after a prior blur on that field', () => {
  const sentinel = new SolaSentinel('test');
  const firstVisit = sentinel.recordFieldFocus('short_description', 0);
  assert.equal(firstVisit, false);

  sentinel.recordFieldBlur('short_description', 'urgent password reset', 500);
  const revisit = sentinel.recordFieldFocus('short_description', 800);
  assert.equal(revisit, true);
  assert.equal(sentinel.fieldHistory.at(-1).revisit, true);
});

test('recordFieldBlur truncates long values to the last 200 chars and records length', () => {
  const sentinel = new SolaSentinel('test');
  const long = 'x'.repeat(300);
  sentinel.recordFieldBlur('notes', long, 0);
  const event = sentinel.fieldHistory[0];
  assert.equal(event.valueLength, 300);
  assert.equal(event.valuePreview.length, 200);
  assert.equal(event.valuePreview, long.slice(-200));
});

test('checkSignificance stays false below the minimum event count', () => {
  const sentinel = new SolaSentinel('test');
  sentinel.recordFieldFocus('a', 0);
  assert.equal(sentinel.checkSignificance(5000), false);
});

test('checkSignificance stays false while the user is still active (no idle gap yet)', () => {
  const sentinel = new SolaSentinel('test');
  sentinel.recordFieldFocus('a', 0);
  sentinel.recordFieldBlur('a', 'hello', 100);
  assert.equal(sentinel.checkSignificance(200), false); // only 100ms idle, threshold is 1500ms
});

test('checkSignificance fires once after the idle threshold, then throttles', () => {
  const sentinel = new SolaSentinel('test');
  sentinel.recordFieldFocus('a', 0);
  sentinel.recordFieldBlur('a', 'hello', 100);

  assert.equal(sentinel.checkSignificance(1700), true); // 1600ms idle, past 1500ms threshold
  assert.equal(sentinel.checkSignificance(1750), false); // no new activity since last fire
  assert.equal(sentinel.checkSignificance(9000), false); // still within 8s min interval, no new activity anyway
});

test('checkSignificance fires again after new activity plus a fresh idle gap', () => {
  const sentinel = new SolaSentinel('test');
  sentinel.recordFieldFocus('a', 0);
  sentinel.recordFieldBlur('a', 'hello', 100);
  assert.equal(sentinel.checkSignificance(1700), true);

  sentinel.recordFieldFocus('b', 9800); // new activity after the min-interval window opens
  assert.equal(sentinel.checkSignificance(9900), false); // no idle gap yet since new activity
  assert.equal(sentinel.checkSignificance(11400), true); // idle gap satisfied, min interval satisfied
});

test('flowIndex starts at the baseline with no activity', () => {
  const sentinel = new SolaSentinel('test');
  assert.equal(sentinel.flowIndex, 99.8);
});

test('flowIndex is a real computed score: smooth vs. rough sequences differ', () => {
  const smooth = new SolaSentinel('smooth');
  smooth.recordFieldFocus('a', 0);
  smooth.recordFieldBlur('a', 'hello', 1000);
  smooth.recordFieldFocus('b', 2000);
  smooth.recordFieldBlur('b', 'world', 3000);

  const rough = new SolaSentinel('rough');
  rough.recordFieldFocus('a', 0);
  rough.recordFieldBlur('a', 'hello', 100);
  rough.recordFieldFocus('b', 150);
  rough.recordFieldBlur('b', '', 8000); // erratic gap
  rough.recordFieldFocus('a', 8050); // revisit
  rough.recordFieldBlur('a', 'hello again', 8100);
  rough.triggerFrictionAlert({ type: 'RAGE_CLICK', severity: 'HIGH', timestamp: 8100, message: 'test rage click' });

  assert.ok(smooth.flowIndex > rough.flowIndex, `expected smooth (${smooth.flowIndex}) > rough (${rough.flowIndex})`);
  assert.ok(rough.flowIndex < 99.8);
});

test('flowIndex penalizes revisits proportionally to how much of the session they make up', () => {
  const lowRevisit = new SolaSentinel('low-revisit');
  lowRevisit.recordFieldFocus('a', 0);
  lowRevisit.recordFieldBlur('a', 'x', 500);
  lowRevisit.recordFieldFocus('b', 1000);
  lowRevisit.recordFieldBlur('b', 'y', 1500);
  lowRevisit.recordFieldFocus('c', 2000);

  const highRevisit = new SolaSentinel('high-revisit');
  highRevisit.recordFieldFocus('a', 0);
  highRevisit.recordFieldBlur('a', 'x', 500);
  highRevisit.recordFieldFocus('a', 1000); // revisit
  highRevisit.recordFieldBlur('a', 'x', 1500);
  highRevisit.recordFieldFocus('a', 2000); // revisit

  assert.ok(highRevisit.flowIndex < lowRevisit.flowIndex);
});

test('buildPrompt returns null with no observed activity', () => {
  const sentinel = new SolaSentinel('test');
  assert.equal(sentinel.buildPrompt(), null);
});

test('buildPrompt describes focus, revisit, empty, and filled fields in order', () => {
  const sentinel = new SolaSentinel('test');
  sentinel.recordFieldFocus('short_description', 0);
  sentinel.recordFieldBlur('short_description', 'urgent password reset', 500);
  sentinel.recordFieldFocus('priority', 600);
  sentinel.recordFieldBlur('priority', '', 700);
  sentinel.recordFieldFocus('short_description', 800);

  const prompt = sentinel.buildPrompt();
  assert.match(prompt, /User focused field "short_description"/);
  assert.match(prompt, /Field "short_description" now contains: "urgent password reset"/);
  assert.match(prompt, /User left field "priority" empty/);
  assert.match(prompt, /User returned to field "short_description"/);
  assert.match(prompt, /Respond as compact JSON only/);
});

test('typing alone can clear the significance gate — no blur required', () => {
  const sentinel = createSentinel('typing', {
    idleThresholdMs: 0, minSuggestIntervalMs: 0, minEventsForSuggestion: 2
  });
  sentinel.recordFieldFocus('city', 1000);
  sentinel.recordFieldInput('city', 'Lis', 1100);
  sentinel.recordFieldInput('city', 'Lisbon', 1200);

  assert.equal(sentinel.checkSignificance(3000), true);
  assert.match(sentinel.buildPrompt(), /User is typing in "city": "Lisbon"/);
});

test('a run of keystrokes in one field collapses into one evolving event', () => {
  const sentinel = createSentinel('typing');
  sentinel.recordFieldFocus('q', 1000);
  for (let i = 1; i <= 20; i++) sentinel.recordFieldInput('q', 'x'.repeat(i), 1000 + i);

  const inputs = sentinel.fieldHistory.filter((e) => e.type === 'input');
  assert.equal(inputs.length, 1, 'one event, not twenty');
  assert.equal(inputs[0].valueLength, 20, 'holds the latest value');
});

test('typing in a different field starts a new event', () => {
  const sentinel = createSentinel('typing');
  sentinel.recordFieldInput('a', 'one', 1000);
  sentinel.recordFieldInput('b', 'two', 1100);
  assert.equal(sentinel.fieldHistory.filter((e) => e.type === 'input').length, 2);
});
