// ─── Sola Sentinel & Ambient Intent Telemetry Observer ───
// Rage-click / signal-drop friction detection, plus ambient field-level
// behavior capture (focus, revisit, blur-with-value) feeding a debounced
// significance gate and a prompt builder for $intent-driven suggestions.

const FIELD_BUFFER_MAX_EVENTS = 50;
const FIELD_BUFFER_WINDOW_MS = 60_000;
const FIELD_TEXT_PREVIEW_MAX_CHARS = 200;

function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export class SolaSentinel {
  constructor(name = 'default', options = {}) {
    this.name = name;
    this.thresholdMs = options.thresholdMs || 600;
    this.maxRageClicks = options.maxRageClicks || 3;
    this.clickHistory = [];
    this.subscribers = new Set();
    this.frictionEvents = [];
    this.flowIndex = 99.8;

    // Ambient field-behavior observation
    this.fieldHistory = [];
    this.lastActivityAt = 0;
    this.lastSuggestedAt = -Infinity;
    this.idleThresholdMs = options.idleThresholdMs ?? 1500;
    this.minSuggestIntervalMs = options.minSuggestIntervalMs ?? 8000;
    this.minEventsForSuggestion = options.minEventsForSuggestion ?? 2;
  }

  recordClick(actionId, target = 'button') {
    const ts = now();
    this.clickHistory.push({ actionId, target, timestamp: ts });
    this.clickHistory = this.clickHistory.filter(c => ts - c.timestamp < 2000);

    const recent = this.clickHistory.filter(c => c.actionId === actionId && ts - c.timestamp < this.thresholdMs);
    if (recent.length >= this.maxRageClicks) {
      this.triggerFrictionAlert({
        type: 'RAGE_CLICK',
        actionId,
        target,
        count: recent.length,
        timestamp: ts,
        severity: 'HIGH',
        message: `Rage-click burst: ${recent.length} taps in ${Math.round(ts - recent[0].timestamp)}ms`
      });
    }
  }

  recordSignalDrop(topic, error) {
    this.triggerFrictionAlert({
      type: 'SIGNAL_TIMEOUT',
      topic,
      error: error?.message || String(error),
      timestamp: now(),
      severity: 'CRITICAL',
      message: `Signal channel "${topic}" breached SLA timeout (504 Gateway Stall)`
    });
  }

  triggerFrictionAlert(event) {
    this.frictionEvents.unshift(event);
    if (this.frictionEvents.length > 50) this.frictionEvents.pop();
    this._recomputeFlowIndex(event.timestamp);

    this.subscribers.forEach(cb => {
      try { cb(event, this); } catch (e) { console.error(e); }
    });
  }

  onFriction(cb) {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  // ─── Flow index ───
  // A real computed score, not a fixed decrement: severity- and recency-weighted
  // friction events, the share of field visits that were backtracks, plus how
  // erratic the pacing between field events is (a proxy for hesitation).
  _recomputeFlowIndex(ts = now()) {
    let score = 99.8;

    const recentFriction = this.frictionEvents.filter(e => ts - e.timestamp < 120_000);
    score -= recentFriction.reduce((sum, e) => {
      const severityWeight = e.severity === 'CRITICAL' ? 6 : e.severity === 'HIGH' ? 3.8 : 2;
      const recencyWeight = Math.max(0.3, 1 - (ts - e.timestamp) / 120_000);
      return sum + severityWeight * recencyWeight;
    }, 0);

    const focusEvents = this.fieldHistory.filter(e => e.type === 'focus');
    if (focusEvents.length > 0) {
      const revisitRatio = focusEvents.filter(e => e.revisit).length / focusEvents.length;
      score -= revisitRatio * 15;
    }

    if (this.fieldHistory.length >= 3) {
      const gaps = [];
      for (let i = 1; i < this.fieldHistory.length; i++) {
        gaps.push(this.fieldHistory[i].timestamp - this.fieldHistory[i - 1].timestamp);
      }
      const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const variance = gaps.reduce((sum, g) => sum + (g - mean) ** 2, 0) / gaps.length;
      score -= Math.min(10, Math.sqrt(variance) / 500);
    }

    this.flowIndex = Math.max(0, Math.min(99.8, Number(score.toFixed(1))));
    return this.flowIndex;
  }

  // ─── Ambient field observation ───

  _pushFieldEvent(event) {
    this.fieldHistory.push(event);
    this.fieldHistory = this.fieldHistory
      .filter(e => event.timestamp - e.timestamp < FIELD_BUFFER_WINDOW_MS)
      .slice(-FIELD_BUFFER_MAX_EVENTS);
    this.lastActivityAt = event.timestamp;
    this._recomputeFlowIndex(event.timestamp);
  }

  recordFieldFocus(fieldId, ts = now()) {
    const revisit = this.fieldHistory.some(e => e.type === 'blur' && e.fieldId === fieldId);
    this._pushFieldEvent({ type: 'focus', fieldId, revisit, timestamp: ts });
    return revisit;
  }

  recordFieldBlur(fieldId, value, ts = now()) {
    const text = String(value ?? '');
    const preview = text.length > FIELD_TEXT_PREVIEW_MAX_CHARS
      ? text.slice(-FIELD_TEXT_PREVIEW_MAX_CHARS)
      : text;
    this._pushFieldEvent({ type: 'blur', fieldId, valuePreview: preview, valueLength: text.length, timestamp: ts });
  }

  // ─── Significance gate ───
  // Fires at most once per `minSuggestIntervalMs`, only after `idleThresholdMs`
  // of inactivity following new activity — never on every keystroke.
  checkSignificance(ts = now()) {
    if (this.fieldHistory.length < this.minEventsForSuggestion) return false;
    if (this.lastActivityAt <= this.lastSuggestedAt) return false;
    if (ts - this.lastActivityAt < this.idleThresholdMs) return false;
    if (ts - this.lastSuggestedAt < this.minSuggestIntervalMs) return false;

    this.lastSuggestedAt = ts;
    return true;
  }

  // ─── Prompt builder ───
  // Compact natural-language description of recent field activity, oldest first.
  buildPrompt() {
    if (this.fieldHistory.length === 0) return null;

    const lines = this.fieldHistory.map(e => {
      if (e.type === 'focus') {
        return e.revisit
          ? `User returned to field "${e.fieldId}".`
          : `User focused field "${e.fieldId}".`;
      }
      if (e.valueLength === 0) return `User left field "${e.fieldId}" empty.`;
      return `Field "${e.fieldId}" now contains: "${e.valuePreview}"`;
    });

    return [
      'You are an ambient UX assistant embedded in a form.',
      'Recent user activity, oldest first:',
      ...lines,
      '',
      'Based only on this activity, suggest exactly one concise, specific next-step action the user might want.',
      'Respond as compact JSON only: {"label": string (<=60 chars), "action": string (<=140 chars), "confidence": number 0-1}.',
      'If nothing useful can be suggested, respond {"label": null}.'
    ].join('\n');
  }
}

export function createSentinel(name, options) {
  return new SolaSentinel(name, options);
}
