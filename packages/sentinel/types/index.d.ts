// Type declarations for @sola-air-ui/sentinel.

export interface SentinelOptions {
  /** Window in which repeated clicks on one action count as a burst. Default 600ms. */
  thresholdMs?: number;
  /** Clicks within that window before a rage-click is reported. Default 3. */
  maxRageClicks?: number;
  /** Quiet period after activity before a suggestion may fire. Default 1500ms. */
  idleThresholdMs?: number;
  /** Minimum gap between two suggestions. Default 8000ms. */
  minSuggestIntervalMs?: number;
  /** Field events required before suggesting anything. Default 2. */
  minEventsForSuggestion?: number;
}

export type FrictionSeverity = 'LOW' | 'HIGH' | 'CRITICAL';

export interface FrictionEvent {
  type: 'RAGE_CLICK' | 'SIGNAL_TIMEOUT';
  timestamp: number;
  severity: FrictionSeverity;
  message: string;
  actionId?: string;
  target?: string;
  count?: number;
  topic?: string;
  error?: string;
}

export type FieldEvent =
  | { type: 'focus'; fieldId: string; revisit: boolean; timestamp: number }
  | { type: 'input'; fieldId: string; valuePreview: string; valueLength: number; timestamp: number }
  | { type: 'blur'; fieldId: string; valuePreview: string; valueLength: number; timestamp: number };

export class SolaSentinel {
  constructor(name?: string, options?: SentinelOptions);

  readonly name: string;
  /** 0–99.8, recomputed from friction severity, backtracking, and pacing. */
  readonly flowIndex: number;
  readonly frictionEvents: FrictionEvent[];
  readonly fieldHistory: FieldEvent[];

  recordClick(actionId: string, target?: string): void;
  recordSignalDrop(topic: string, error: Error | string): void;
  triggerFrictionAlert(event: FrictionEvent): void;
  onFriction(cb: (event: FrictionEvent, sentinel: SolaSentinel) => void): () => void;

  /** Records focus; returns true when the user is returning to the field. */
  recordFieldFocus(fieldId: string, ts?: number): boolean;
  /** Records typing. A run of keystrokes in one field collapses into one event. */
  recordFieldInput(fieldId: string, value: unknown, ts?: number): void;
  recordFieldBlur(fieldId: string, value: unknown, ts?: number): void;

  /** True at most once per `minSuggestIntervalMs`, after a quiet period. */
  checkSignificance(ts?: number): boolean;
  /** Natural-language description of recent activity, or null if there is none. */
  buildPrompt(): string | null;
}

export function createSentinel(name?: string, options?: SentinelOptions): SolaSentinel;

export interface ObserveOptions extends SentinelOptions {
  /** Called when the significance gate opens, with the prompt the Sentinel built. */
  onSuggest?: (prompt: string, sentinel: SolaSentinel) => void;
  /**
   * Rewrite a value before it is recorded — return '' to keep only its length.
   * Password, hidden and file inputs, one-time codes and card fields, and
   * anything under `[data-sentinel-ignore]` are excluded before this is called.
   */
  redact?: (fieldName: string, value: string, el: Element) => string;
  /** How often the gate is checked. Default 250ms. 0 disables polling. */
  pollMs?: number;
  /** Sentinel name, for telemetry. */
  name?: string;
  /** Feed an existing Sentinel instead of creating one. */
  sentinel?: SolaSentinel;
}

export interface ObserveHandle {
  sentinel: SolaSentinel;
  disconnect(): void;
}

/**
 * Watch a subtree and feed its field activity to a Sentinel. Attaches by
 * delegation, so an existing form needs no changes.
 */
export function observe(root: Element | Document, options?: ObserveOptions): ObserveHandle;

/** The human-readable name the prompt will use for a field. */
export function fieldNameOf(el: Element): string;

/** True when a field's value must never be recorded. */
export function isSensitive(el: Element): boolean;
