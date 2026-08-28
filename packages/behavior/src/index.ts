// ─── Sola Behavioral Intent Engine (@sola/behavior) ───
// Real-time implicit generative adaptation based on interaction telemetry.
// 100% Client-Side Privacy: zero keystrokes logged, only local timing vectors.
// Touch-device compatible: long-press = hover dwell on mobile.

export type PersonaType = 'visual_explorer' | 'sre_commander' | 'finops_auditor';

export interface BehavioralMetrics {
  typingVelocityCps: number;
  activeDwellTarget: string | null;
  dwellDurationMs: number;
  rageClickCount: number;
  persona: PersonaType;
  densityMode: 'comfortable' | 'compact' | 'emergency';
}

const STORAGE_KEY = 'sola_behavior_persona';

export class BehavioralObserver {
  private keydownTimestamps: number[] = [];
  private dwellTimer: any = null;
  private currentDwellId: string | null = null;
  private dwellStart = 0;
  private clickTimestamps: Map<string, number[]> = new Map();
  private listeners: Set<(metrics: BehavioralMetrics) => void> = new Set();
  private touchMoved = false;

  private state: BehavioralMetrics = {
    typingVelocityCps: 0,
    activeDwellTarget: null,
    dwellDurationMs: 0,
    rageClickCount: 0,
    persona: 'visual_explorer',
    densityMode: 'comfortable'
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadPersistedPersona();
      this.attachGlobalListeners();
    }
  }

  private loadPersistedPersona() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'sre_commander' || saved === 'finops_auditor') {
        this.state.persona = saved;
      }
    } catch {}
  }

  private persistPersona() {
    try {
      localStorage.setItem(STORAGE_KEY, this.state.persona);
    } catch {}
  }

  private emit() {
    this.recalculatePersona();
    this.persistPersona();
    this.listeners.forEach(fn => {
      try { fn({ ...this.state }); } catch (e) { console.error(e); }
    });
  }

  private recalculatePersona() {
    if (this.state.rageClickCount >= 2 || this.state.activeDwellTarget === 'incident') {
      this.state.persona = 'sre_commander';
      this.state.densityMode = 'emergency';
    } 
    else if (this.state.typingVelocityCps >= 5) {
      this.state.persona = 'sre_commander';
      this.state.densityMode = 'compact';
    } 
    else if (this.state.activeDwellTarget === 'finops' || this.state.activeDwellTarget === 'waterfall') {
      this.state.persona = 'finops_auditor';
      this.state.densityMode = 'comfortable';
    } 
    else {
      this.state.persona = 'visual_explorer';
      this.state.densityMode = 'comfortable';
    }
  }

  public registerKeyStroke() {
    const now = performance.now();
    this.keydownTimestamps.push(now);
    if (this.keydownTimestamps.length > 10) this.keydownTimestamps.shift();

    if (this.keydownTimestamps.length >= 2) {
      const elapsedSec = (now - this.keydownTimestamps[0]) / 1000;
      if (elapsedSec > 0) {
        this.state.typingVelocityCps = Number((this.keydownTimestamps.length / elapsedSec).toFixed(1));
      }
    }
    this.emit();
  }

  // Works for both mouse hover AND touch long-press
  public registerHoverStart(targetId: string, onDwellThreshold?: () => void, thresholdMs = 1200) {
    this.currentDwellId = targetId;
    this.dwellStart = performance.now();
    this.state.activeDwellTarget = targetId;

    if (this.dwellTimer) clearTimeout(this.dwellTimer);
    this.dwellTimer = setTimeout(() => {
      if (this.currentDwellId === targetId) {
        this.state.dwellDurationMs = thresholdMs;
        this.emit();
        if (onDwellThreshold) onDwellThreshold();
      }
    }, thresholdMs);

    this.emit();
  }

  public registerHoverEnd(targetId: string) {
    if (this.currentDwellId === targetId) {
      this.currentDwellId = null;
      this.state.activeDwellTarget = null;
      this.state.dwellDurationMs = 0;
      if (this.dwellTimer) clearTimeout(this.dwellTimer);
      this.emit();
    }
  }

  // Touch-specific: call on touchstart, starts dwell timer
  // touchmove cancels it, touchend cancels it
  public registerTouchStart(targetId: string, onDwellThreshold?: () => void, thresholdMs = 800) {
    this.touchMoved = false;
    this.registerHoverStart(targetId, onDwellThreshold, thresholdMs);
  }

  public registerTouchMove() {
    this.touchMoved = true;
    // User is scrolling, cancel dwell
    if (this.currentDwellId) {
      this.registerHoverEnd(this.currentDwellId);
    }
  }

  public registerTouchEnd(targetId: string) {
    // Only end dwell if touch didn't trigger a scroll
    if (!this.touchMoved) {
      // Keep dwell active briefly so user can see the expanded state
      setTimeout(() => {
        this.registerHoverEnd(targetId);
      }, 2500);
    } else {
      this.registerHoverEnd(targetId);
    }
  }

  public registerClick(targetId: string, onRageClick?: () => void) {
    const now = performance.now();
    const history = this.clickTimestamps.get(targetId) || [];
    const recent = [...history.filter(t => now - t < 600), now];
    this.clickTimestamps.set(targetId, recent);

    if (recent.length >= 3) {
      this.state.rageClickCount = recent.length;
      this.emit();
      if (onRageClick) onRageClick();
    }
  }

  public resetUrgency() {
    this.state.rageClickCount = 0;
    this.clickTimestamps.clear();
    this.emit();
  }

  public subscribe(fn: (metrics: BehavioralMetrics) => void): () => void {
    this.listeners.add(fn);
    fn({ ...this.state });
    return () => this.listeners.delete(fn);
  }

  private attachGlobalListeners() {
    // Reset typing cadence if idle for >1.5s
    setInterval(() => {
      const now = performance.now();
      if (this.keydownTimestamps.length > 0 && now - this.keydownTimestamps[this.keydownTimestamps.length - 1] > 1500) {
        this.keydownTimestamps = [];
        this.state.typingVelocityCps = 0;
        this.emit();
      }
    }, 500);
  }
}

export const behavioralObserver = new BehavioralObserver();
