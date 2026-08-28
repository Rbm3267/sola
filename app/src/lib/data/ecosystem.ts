export interface SaasIntegration {
  id: string;
  name: string;
  category: 'ITSM & Security' | 'Cloud & DevOps' | 'Observability' | 'Databases' | 'Billing & Finance' | 'AI & Agents' | 'CRM & Support' | 'Solo & MCP';
  badge: string;
  description: string;
  protocolUri: string;
  primaryComponent: string;
  sampleIntent: string;
  config: any;
}

export const SAAS_ECOSYSTEM: SaasIntegration[] = [
  // ── 1. ITSM & Enterprise Workflows ──
  {
    id: 'servicenow-incidents',
    name: 'ServiceNow ITSM Incident Command',
    category: 'ITSM & Security',
    badge: 'ServiceNow',
    description: 'P1 Incident triage capsule with live SLA breach dial, blast radius, and 1-click playbooks.',
    protocolUri: 'now://table/incident?query=priority=1^state!=7',
    primaryComponent: 'IncidentTriageMatrix',
    sampleIntent: 'Surface active P1 ServiceNow incidents breaching SLA in 30 minutes',
    config: {
      incidentId: 'INC009481',
      title: 'API Gateway High-Frequency Latency Spike (EU-West)',
      severity: 'P1 - Critical',
      slaRemainingMin: 11,
      blastRadius: '42,000 Active Checkout Sessions',
      playbooks: [
        { id: 'pb-1', title: 'Reroute Edge DNS to eu-central-1', action: 'Route53 Failover', automated: true },
        { id: 'pb-2', title: 'Scale Redis Cluster Read Replicas (x4)', action: 'Auto-Provision', automated: true },
        { id: 'pb-3', title: 'Page Tier 3 Database SRE On-Call', action: 'PagerDuty Incident', automated: false }
      ]
    }
  },
  {
    id: 'servicenow-cab',
    name: 'ServiceNow Change Advisory Board (CAB)',
    category: 'ITSM & Security',
    badge: 'ServiceNow',
    description: 'Cryptographic state change review with risk level score and 1-click ACL approvals.',
    protocolUri: 'now://table/change_request?state=scheduled',
    primaryComponent: 'DiffAudit',
    sampleIntent: 'Review pending CAB changes for tonight 02:00 UTC window',
    config: {
      title: 'Upgrade Production Redis Cluster Capacity (x10)',
      entityId: 'CHG009842',
      entityType: 'ServiceNow CAB Release',
      riskLevel: 'Moderate',
      riskScore: 42,
      requester: 'Tier 3 Platform SRE',
      window: 'Tonight 02:00 – 04:00 UTC'
    }
  },
  {
    id: 'pagerduty-oncall',
    name: 'PagerDuty Incident Escalation Bus',
    category: 'ITSM & Security',
    badge: 'PagerDuty',
    description: 'Live responder schedule, active pages, and automated escalation policy matrix.',
    protocolUri: 'pagerduty://incidents/active',
    primaryComponent: 'ListBlock',
    sampleIntent: 'List all open PagerDuty escalations for SRE Platform team',
    config: {
      title: 'PagerDuty Live Incidents & On-Call Rotation',
      items: [
        { label: 'Egress Latency Threshold Exceeded', description: 'Triggered 4m ago • Primary: Alex Chen (Tier 3)', status: 'Active' },
        { label: 'Auth Token Cache Replication Delay', description: 'Triggered 18m ago • Acked by Security Ops', status: 'Active' },
        { label: 'CloudWatch Synthetics Heartbeat Fail', description: 'Auto-resolved after DNS route flip', status: 'Completed' }
      ]
    }
  },
  {
    id: 'jira-service-management',
    name: 'Jira Service Management SLA Queue',
    category: 'ITSM & Security',
    badge: 'Jira',
    description: 'Customer ticket backlog with first-response time tracking and assignee routing.',
    protocolUri: 'jira://queue/enterprise-support',
    primaryComponent: 'GaugeCard',
    sampleIntent: 'Track Jira Service Management first response SLA compliance',
    config: {
      title: 'Jira Enterprise SLA Compliance',
      value: '99.2%',
      percentage: 99,
      subtext: 'First Response Time: 4.2 mins (Target: <15m)',
      color: 'emerald'
    }
  },

  // ── 2. Cloud Infrastructure & DevOps ──
  {
    id: 'aws-rds-mesh',
    name: 'AWS RDS Multi-Region Cluster Mesh',
    category: 'Cloud & DevOps',
    badge: 'AWS',
    description: '12 primary and read-replica database shards across 6 global availability zones.',
    protocolUri: 'aws://rds/cluster-topology',
    primaryComponent: 'ClusterMatrix',
    sampleIntent: 'Display global AWS RDS cluster health and replication lag',
    config: {
      title: 'AWS us-east-1 RDS Read Replica Cluster Mesh',
      subtitle: '12 Regional Shards Distributed Across 6 Global Regions'
    }
  },
  {
    id: 'aws-cost-breakdown',
    name: 'AWS FinOps Monthly Cloud Bill Breakdown',
    category: 'Cloud & DevOps',
    badge: 'AWS FinOps',
    description: 'EC2, RDS, S3, and Data Egress cloud cost realization waterfall.',
    protocolUri: 'aws://ce/monthly-spend',
    primaryComponent: 'FlowWaterfall',
    sampleIntent: 'Break down monthly AWS infrastructure spend by service',
    config: {
      title: 'AWS Cloud Cost Allocation & Realization',
      subtitle: 'End-to-end deduction breakdown across compute, egress, and reserved instances',
      steps: [
        { id: '1', name: 'Initial Monthly Budget', delta: 45000, type: 'start', formattedValue: '$45,000' },
        { id: '2', name: 'EC2 & EKS Worker Nodes', delta: -18400, type: 'debit', formattedValue: '-$18,400' },
        { id: '3', name: 'RDS Aurora Multi-AZ DB', delta: -8900, type: 'debit', formattedValue: '-$8,900' },
        { id: '4', name: 'CloudFront & Direct Connect Egress', delta: -3200, type: 'debit', formattedValue: '-$3,200' },
        { id: '5', name: 'Savings Plan Commitment Credit', delta: 4800, type: 'credit', formattedValue: '+$4,800' },
        { id: '6', name: 'Net Cloud Expenditure', delta: 19300, type: 'total', formattedValue: '$19,300 Remaining' }
      ]
    }
  },
  {
    id: 'k8s-pod-scaler',
    name: 'Kubernetes Auto-Scale Dial Controller',
    category: 'Cloud & DevOps',
    badge: 'Kubernetes',
    description: 'Tactile rotary dial to throttle cluster worker allocation and replica count.',
    protocolUri: 'k8s://deployments/web-ingress',
    primaryComponent: 'TactileDialCard',
    sampleIntent: 'Set Kubernetes web ingress autoscaling ceiling to 48 replicas',
    config: {
      title: 'K8s Replica Ceiling Controller',
      value: 48,
      unit: 'pods',
      subtext: 'Auto-scales based on p99 ingress latency'
    }
  },
  {
    id: 'github-actions-telemetry',
    name: 'GitHub Actions CI/CD Release Stream',
    category: 'Cloud & DevOps',
    badge: 'GitHub',
    description: 'Real-time commit pipeline execution and test matrix artifact status.',
    protocolUri: 'github://actions/main/runs',
    primaryComponent: 'StreamView',
    sampleIntent: 'Stream live GitHub Actions build steps for main branch',
    config: {
      title: 'GitHub Actions Production Build Matrix',
      events: [
        { id: 'gh-1', message: 'Build container #9042 bundled in 42s', timestamp: 'Just now', type: 'success' },
        { id: 'gh-2', message: 'End-to-end Playwright matrix passed (128/128)', timestamp: '24s ago', type: 'success' },
        { id: 'gh-3', message: 'Vercel Edge preview deployed to production', timestamp: '1m ago', type: 'info' }
      ]
    }
  },

  // ── 3. Observability & APM ──
  {
    id: 'datadog-apm',
    name: 'Datadog Distributed APM Trace Spans',
    category: 'Observability',
    badge: 'Datadog',
    description: 'End-to-end request span latency waterfall across microservices.',
    protocolUri: 'datadog://traces/checkout-service',
    primaryComponent: 'FlowWaterfall',
    sampleIntent: 'Show Datadog APM span latency breakdown for checkout API',
    config: {
      title: 'Datadog APM Trace Latency Breakdown',
      subtitle: 'Span breakdown from Edge Gateway to Database Commit',
      steps: [
        { id: 't1', name: 'API Gateway Ingress', delta: 4.2, type: 'start', formattedValue: '4.2 ms' },
        { id: 't2', name: 'OAuth JWT Validation', delta: 2.1, type: 'debit', formattedValue: '+2.1 ms' },
        { id: 't3', name: 'PostgreSQL Read Replica', delta: 8.4, type: 'debit', formattedValue: '+8.4 ms' },
        { id: 't4', name: 'Redis Cache Hit Offset', delta: -1.8, type: 'credit', formattedValue: '-1.8 ms' },
        { id: 't5', name: 'Total p99 End-to-End Latency', delta: 12.9, type: 'total', formattedValue: '12.9 ms' }
      ]
    }
  },
  {
    id: 'grafana-nodes',
    name: 'Grafana Node Exporter Matrix',
    category: 'Observability',
    badge: 'Grafana',
    description: 'Real-time CPU and memory load matrix across 24 bare-metal Linux nodes.',
    protocolUri: 'prometheus://node_exporter/cluster',
    primaryComponent: 'ClusterMatrix',
    sampleIntent: 'Display Prometheus node exporter metrics matrix',
    config: {
      title: 'Prometheus Node Exporter Mesh',
      subtitle: '24 Compute Instances Across 4 Edge Zones'
    }
  },

  // ── 4. Databases & Data Warehouses ──
  {
    id: 'postgres-schema',
    name: 'PostgreSQL Schema & Index Inspector',
    category: 'Databases',
    badge: 'PostgreSQL',
    description: 'Relational table structure, column types, row estimates, and foreign-key links.',
    protocolUri: 'postgres://production/public.incident',
    primaryComponent: 'SchemaInspector',
    sampleIntent: 'Inspect PostgreSQL table schema and foreign keys for public.incident',
    config: {
      table: 'public.incident',
      rowCount: '2,419,042',
      sizeBytes: '842 MB'
    }
  },
  {
    id: 'supabase-realtime',
    name: 'Supabase Real-Time Row Sync',
    category: 'Databases',
    badge: 'Supabase',
    description: 'Postgres row-level change streams connected directly to native DOM signals.',
    protocolUri: 'supabase://realtime/public.orders',
    primaryComponent: 'DataCard',
    sampleIntent: 'Monitor Supabase real-time orders revenue volume',
    config: {
      title: 'Supabase Live Stream Revenue',
      value: '$242,900',
      trend: '+38.4% vs last week',
      icon: 'trending-up'
    }
  },
  {
    id: 'snowflake-warehouse',
    name: 'Snowflake Enterprise Warehouse Query Load',
    category: 'Databases',
    badge: 'Snowflake',
    description: 'Warehouse credit consumption, active query concurrency, and warehouse scaling.',
    protocolUri: 'snowflake://analytics/compute_wh',
    primaryComponent: 'GaugeCard',
    sampleIntent: 'Show Snowflake warehouse compute utilization',
    config: {
      title: 'Snowflake COMPUTE_WH Utilization',
      value: '76%',
      percentage: 76,
      subtext: '4 Active Clusters • Auto-Suspend in 10m',
      color: 'sky'
    }
  },

  // ── 5. Billing, FinTech & Payments ──
  {
    id: 'stripe-revenue-split',
    name: 'Stripe Settlement & Interchange Waterfall',
    category: 'Billing & Finance',
    badge: 'Stripe',
    description: 'End-to-end deduction breakdown from gross payment volume to net bank payout.',
    protocolUri: 'stripe://balance/settlement-history',
    primaryComponent: 'FlowWaterfall',
    sampleIntent: 'Show Stripe revenue deduction waterfall and net payout',
    config: {
      title: 'Stripe Realized Settlement Breakdown',
      subtitle: 'End-to-end deduction reconciliation from gross payment volume to net bank transfer'
    }
  },
  {
    id: 'stripe-mrr',
    name: 'Stripe Monthly Recurring Revenue (MRR)',
    category: 'Billing & Finance',
    badge: 'Stripe',
    description: 'Subscription ARR, expansion revenue, and net customer churn rate.',
    protocolUri: 'stripe://subscriptions/mrr',
    primaryComponent: 'DataCard',
    sampleIntent: 'Show Stripe SaaS MRR velocity and expansion revenue',
    config: {
      title: 'Monthly Recurring Revenue',
      value: '$184,200',
      trend: '+$14,800 this month',
      icon: 'trending-up'
    }
  },

  // ── 6. AI, Agents & Foundation Models ──
  {
    id: 'a2a-orchestration',
    name: 'Agent-to-Agent (A2A) Multi-Model Bus',
    category: 'AI & Agents',
    badge: 'A2A Protocol',
    description: 'Real-time multi-agent autonomous negotiation, step execution, and task handoffs.',
    protocolUri: 'a2a://orchestrator/session-904',
    primaryComponent: 'ListBlock',
    sampleIntent: 'Stream live Agent-to-Agent autonomous task executions',
    config: {
      title: 'Live A2A Autonomous Agent Tasks',
      items: [
        { label: 'Sola Planner Agent', description: 'Decomposed user intent into 3 executable subagent tasks', status: 'Active' },
        { label: 'Database Worker Agent', description: 'Executing index bloat mitigation query on shard 02', status: 'Active' },
        { label: 'Security Validator Agent', description: 'Cryptographic policy signoff verified', status: 'Completed' }
      ]
    }
  },
  {
    id: 'mcp-tool-telemetry',
    name: 'Model Context Protocol (MCP) Stream',
    category: 'AI & Agents',
    badge: 'MCP Tooling',
    description: 'Public API telemetry, GitHub commit feeds, and remote tools via MCP servers.',
    protocolUri: 'mcp://server/tools/execute',
    primaryComponent: 'StreamView',
    sampleIntent: 'Monitor MCP server tool invocation events',
    config: {
      title: 'MCP Autonomous Tool Ingress Feed',
      events: [
        { id: 'mcp-1', message: 'MCP tool weather_query executed in 24ms', timestamp: 'Just now', type: 'success' },
        { id: 'mcp-2', message: 'MCP tool github_commit_sync pulled 48 diffs', timestamp: '18s ago', type: 'info' }
      ]
    }
  },
  {
    id: 'gemini-tokens',
    name: 'Google Gemini Token Consumption & Latency',
    category: 'AI & Agents',
    badge: 'Gemini 3.6',
    description: 'Real-time inference tokens/sec, prompt cache hit rate, and latency distribution.',
    protocolUri: 'gemini://usage/telemetry',
    primaryComponent: 'GaugeCard',
    sampleIntent: 'Track Gemini API token throughput and prompt cache hit rate',
    config: {
      title: 'Gemini 3.6 Flash Prompt Cache Hit',
      value: '94.8%',
      percentage: 95,
      subtext: '48.2k tokens/s • p50 Latency: 110ms',
      color: 'amber'
    }
  },

  // ── 7. Solo Dev & Edge Relays ──
  {
    id: 'sheets-finance',
    name: 'Google Sheets Live Spreadsheet Relay',
    category: 'Solo & MCP',
    badge: 'Google Sheets',
    description: '1-line reactive binding to Google Sheets CSV with 15s zero-backend synchronization.',
    protocolUri: 'sheet://1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    primaryComponent: 'DataCard',
    sampleIntent: 'Connect live Google Sheets relay for financial runway and MRR',
    config: {
      title: 'Google Sheet Live MRR',
      value: '$184,200',
      trend: '+$14,800 this month (Auto-Parsed CSV)',
      icon: 'trending-up'
    }
  },
  {
    id: 'cloudflare-d1',
    name: 'Cloudflare D1 & Workers SQLite Relay',
    category: 'Solo & MCP',
    badge: 'Cloudflare D1',
    description: 'Serverless edge SQL table schema and low-latency query explorer.',
    protocolUri: 'sqlite://cloudflare-d1/users',
    primaryComponent: 'SchemaInspector',
    sampleIntent: 'Inspect Cloudflare D1 edge database schema for users',
    config: {
      table: 'cloudflare_d1.users',
      rowCount: '48,200',
      sizeBytes: '12.4 MB'
    }
  },

  // ── 8. Technical Artifacts & On-Demand Report Generators ──
  {
    id: 'sre-incident-report',
    name: 'SRE Incident Postmortem Brief (HTML/MD)',
    category: 'ITSM & Security',
    badge: 'Artifact Viewer',
    description: 'Luxury native Markdown and HTML presentation viewer with tables, alert callouts, and 1-click HTML/MD export.',
    protocolUri: 'artifact://sre/incident-postmortem.html',
    primaryComponent: 'ReportDocViewer',
    sampleIntent: 'Render internal SRE postmortem brief with blast radius table and remediation diff',
    config: {
      title: 'SRE Postmortem: Database Connection Exhaustion (P1)',
      classification: 'Internal Only',
      author: 'Principal Systems Reliability Architect',
      date: 'August 28, 2026'
    }
  },
  {
    id: 'on-demand-report-engine',
    name: 'On-Demand Technical Report Generator',
    category: 'Cloud & DevOps',
    badge: 'Report Engine',
    description: 'Technical component with 1-click generation triggers that synthesizes structured reports, timelines, and standalone HTML artifacts.',
    protocolUri: 'generator://reports/synthesis',
    primaryComponent: 'ActionReportGenerator',
    sampleIntent: 'Generate executive incident postmortem and FinOps audit report with 1-click export',
    config: {
      title: 'System Architecture & Incident Report Engine'
    }
  }
];
