// ─── Sola Universal ActionContract Protocol ───
// Bridges Live Data State (Driver 1) with Human Behavioral Telemetry (Driver 2)

export type ActionSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type VisualAffordance = 'hidden' | 'calm' | 'expanded_preview' | 'urgent_override';
export type TransactionCapability = 'idempotent' | 'transactional' | 'fire_and_forget';

export interface BehavioralVector {
  activeDwellTarget: string | null;
  dwellDurationMs: number;
  rageClickCount: number;
  typingVelocityCps: number;
  persona: 'visual_explorer' | 'sre_commander' | 'finops_auditor';
  densityMode: 'comfortable' | 'compact' | 'emergency';
}

export interface ActionExecutionContext<TData = any> {
  sourceId: string;
  recordId: string;
  data: TData;
  userContext?: {
    userId: string;
    roles: string[];
  };
  metadata?: Record<string, any>;
}

export interface ActionResult<TOutput = any> {
  success: boolean;
  actionId: string;
  transactionId?: string;
  timestamp: number;
  output?: TOutput;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface IntentRecord<TData = any, TPayload = any> {
  id: string;
  actionId: string;
  recordId: string;
  data: TData;
  payload: TPayload;
  status: 'pending' | 'committed' | 'rolled_back' | 'failed';
  tier: 0 | 1 | 2;
  timestamp: number;
  expiresAt?: number;
  errorMessage?: string;
}

export interface ActionContract<TData = any, TPayload = any, TResult = any> {
  id: string;
  title: string;
  description: string;
  category: 'mitigation' | 'mutation' | 'diagnostic' | 'export';
  severity: ActionSeverity;
  tier: 1 | 2; // Staging tier definition
  capability: TransactionCapability;
  blastRadiusMessage?: string; // Estimated impact message for Tier 2 swipe drawer
  
  // Guard check: Does data & permission allow this action to exist?
  isPermitted?: (ctx: ActionExecutionContext<TData>) => boolean;

  // Dual-Driver evaluation: Should this action be surfaced given current data + human behavior?
  isSurfaced: (data: TData, behavior: BehavioralVector) => boolean;

  // Urgency score from 0.0 to 1.0
  computeUrgency: (data: TData, behavior: BehavioralVector) => number;

  // Resolves the visual representation (Calm pill vs Expanded Drawer vs Urgent 1-Click Button)
  resolveAffordance: (data: TData, behavior: BehavioralVector) => VisualAffordance;

  // Split staging lifecycle
  stage: (payload: TPayload, ctx: ActionExecutionContext<TData>) => Promise<IntentRecord<TData, TPayload>>;
  commit: (intentId: string) => Promise<ActionResult<TResult>>;
  rollback?: (intentId: string) => Promise<ActionResult<TResult>>;
}
