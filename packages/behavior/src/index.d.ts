// Type declarations for @sola-air-ui/behavior.

export type PersonaType = 'visual_explorer' | 'sre_commander' | 'finops_auditor';

export interface BehavioralMetrics {
  typingVelocityCps: number;
  activeDwellTarget: string | null;
  dwellDurationMs: number;
  rageClickCount: number;
  persona: PersonaType;
  densityMode: 'comfortable' | 'compact' | 'emergency';
}

export class BehavioralObserver {
  constructor();

  registerKeyStroke(): void;
  /** Works for both mouse hover and touch long-press. */
  registerHoverStart(targetId: string, onDwellThreshold?: () => void, thresholdMs?: number): void;
  registerHoverEnd(targetId: string): void;
  registerTouchStart(targetId: string, onDwellThreshold?: () => void, thresholdMs?: number): void;
  registerTouchMove(): void;
  registerTouchEnd(targetId: string): void;
  registerClick(targetId: string, onRageClick?: () => void): void;
  resetUrgency(): void;
  /** Calls `fn` immediately with the current metrics, then on every change. */
  subscribe(fn: (metrics: BehavioralMetrics) => void): () => void;
}

/** Shared singleton — most consumers want this rather than their own instance. */
export const behavioralObserver: BehavioralObserver;
