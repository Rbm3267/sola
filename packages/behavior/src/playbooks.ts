// ─── Sola Multi-Domain Action Contracts ───
// Universal playbooks parameterized across any SaaS, Cloud, Database, or Spreadsheet

import type { ActionContract } from '../../core/src/ActionContract';

export const ServiceNowMajorIncidentContract: ActionContract = {
  id: 'sn_major_incident_bridge',
  title: 'Open Major Incident War Room',
  description: 'Escalate to P1 Major Incident, page Tier 3 SRE via PagerDuty, and trigger Route53 traffic failover.',
  category: 'mitigation',
  severity: 'critical',

  isSurfaced: (data, behavior) => {
    // Surfaced if data is P1 or user dwells/rage clicks on it
    const isP1 = data?.severity === 'P1 - Critical' || data?.priority === '1 - Critical';
    return isP1 || behavior.activeDwellTarget === 'incident' || behavior.rageClickCount >= 2;
  },

  computeUrgency: (data, behavior) => {
    let score = 0.5;
    if (behavior.rageClickCount >= 2) score += 0.4;
    if (behavior.dwellDurationMs > 1000) score += 0.2;
    return Math.min(score, 1.0);
  },

  resolveAffordance: (data, behavior) => {
    if (behavior.rageClickCount >= 2) return 'urgent_override';
    if (behavior.dwellDurationMs > 800) return 'expanded_preview';
    return 'calm';
  },

  execute: async (payload, ctx) => {
    return {
      success: true,
      actionId: 'sn_major_incident_bridge',
      timestamp: Date.now(),
      message: `Major Incident bridge opened for ${ctx.recordId || 'INC009481'}. Secondary SRE paged.`
    };
  }
};

export const AwsDrainNodeContract: ActionContract = {
  id: 'aws_drain_node',
  title: 'Drain & Evict Degraded Cluster Node',
  description: 'Safely evicts container pods and schedules replacements across healthy availability zones.',
  category: 'mitigation',
  severity: 'high',

  isSurfaced: (data, behavior) => {
    return data?.percentage > 80 || behavior.activeDwellTarget === 'degraded-node' || behavior.rageClickCount >= 1;
  },

  computeUrgency: (data, behavior) => {
    return behavior.rageClickCount >= 1 ? 0.95 : 0.6;
  },

  resolveAffordance: (data, behavior) => {
    if (behavior.rageClickCount >= 1) return 'urgent_override';
    if (behavior.dwellDurationMs > 800) return 'expanded_preview';
    return 'calm';
  },

  execute: async (payload, ctx) => {
    return {
      success: true,
      actionId: 'aws_drain_node',
      timestamp: Date.now(),
      message: 'Node drain initiated: 42 pods rescheduled to us-east-1b.'
    };
  }
};

export const StripeDunningNoticeContract: ActionContract = {
  id: 'stripe_send_dunning',
  title: 'Trigger Smart Dunning Retry',
  description: 'Retries merchant card payment with optimal bank routing and dispatches automated invoice reminder.',
  category: 'mutation',
  severity: 'medium',

  isSurfaced: (data, behavior) => {
    return behavior.activeDwellTarget === 'finops' || behavior.persona === 'finops_auditor';
  },

  computeUrgency: (data, behavior) => {
    return behavior.dwellDurationMs > 1000 ? 0.8 : 0.4;
  },

  resolveAffordance: (data, behavior) => {
    if (behavior.dwellDurationMs > 800) return 'expanded_preview';
    return 'calm';
  },

  execute: async (payload, ctx) => {
    return {
      success: true,
      actionId: 'stripe_send_dunning',
      timestamp: Date.now(),
      message: 'Smart Dunning sequence dispatched to billing contact.'
    };
  }
};

export const PostgresKillLocksContract: ActionContract = {
  id: 'pg_kill_locks',
  title: 'Terminate Lock-Holding Backend PIDs',
  description: 'Executes pg_terminate_backend on transactions holding exclusive locks longer than 5 seconds.',
  category: 'mitigation',
  severity: 'critical',

  isSurfaced: (data, behavior) => {
    return (data?.activePool && data.activePool > 80) || behavior.persona === 'sre_commander';
  },

  computeUrgency: (data, behavior) => 0.9,

  resolveAffordance: (data, behavior) => {
    if (behavior.rageClickCount >= 1 || behavior.persona === 'sre_commander') return 'urgent_override';
    return 'calm';
  },

  execute: async (payload, ctx) => {
    return {
      success: true,
      actionId: 'pg_kill_locks',
      timestamp: Date.now(),
      message: 'Terminated 3 lock-holding queries on primary replica.'
    };
  }
};
