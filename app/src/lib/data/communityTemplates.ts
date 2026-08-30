export interface SolaTemplate {
  id: string;
  name: string;
  category: 'SaaS & Analytics' | 'Developer & AI' | 'Commerce & Retail' | 'Productivity & Tasks' | 'Operations & Health';
  tagline: string;
  description: string;
  badge: string;
  signals: string[];
  cards: Array<{
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    cols: 1 | 2 | 3;
    value: string | number;
    delta?: string;
    accentColor: string;
    config?: Record<string, any>;
  }>;
  solaCode: string;
}

export const COMMUNITY_TEMPLATES: SolaTemplate[] = [
  // --- Category: SaaS & Analytics ---
  {
    id: 'saas-revenue-waterfall',
    name: 'Subscription ARR & Realization Waterfall',
    category: 'SaaS & Analytics',
    tagline: 'Multi-stage revenue cascade with fee deductions and net payout batches',
    description: 'Tracks recurring revenue growth, churn adjustments, processing fees, and realized merchant settlement.',
    badge: 'Popular',
    signals: ['revenue/gross_volume', 'billing/processing_fees', 'payout/net_settlement'],
    cards: [
      { id: 'c1', type: 'stat', title: 'Monthly Recurring Revenue', subtitle: 'Live subscriber ARR', cols: 1, value: '$184,200', delta: '+14.8%', accentColor: 'emerald' },
      { id: 'c2', type: 'progress', title: 'Net Revenue Retention', subtitle: 'Annualized benchmark', cols: 1, value: 138, delta: '138%', accentColor: 'emerald' },
      { id: 'c3', type: 'waterfall', title: 'Revenue Realization Flow', subtitle: 'Gross billing to net settlement', cols: 2, value: '$184k', accentColor: 'emerald', config: { bars: [{ name: 'Gross Billing', val: 240, d: '+240' }, { name: 'Expansions', val: 40, d: '+40' }, { name: 'Fees & Refunds', val: -30, d: '-30' }, { name: 'Net Realized', val: 250, d: '250' }] } },
      { id: 'c4', type: 'chart', title: 'Subscription Growth Stream', subtitle: 'Signal ingestion rate', cols: 2, value: '94 subs/day', accentColor: 'emerald' }
    ],
    solaCode: `<script>
  let mrr = $state(184200);
  let retention = $state(138);
</script>

<div class="template-grid">
  <div class="card col-1">
    <span class="label">MONTHLY RECURRING REVENUE</span>
    <div class="val">\${mrr.toLocaleString()}</div>
    <span class="trend">+14.8% vs last month</span>
  </div>
  <div class="card col-1">
    <span class="label">NET RETENTION</span>
    <div class="val">{retention}%</div>
    <span class="trend">Optimal cohort</span>
  </div>
</div>`
  },
  {
    id: 'conversion-funnel-matrix',
    name: 'Customer Conversion & Funnel Velocity',
    category: 'SaaS & Analytics',
    tagline: 'Multi-step acquisition funnel tracking visitor-to-paid lifecycle',
    description: 'Surfaces stage conversion rates, drop-off friction points, and customer lifetime value metrics.',
    badge: 'Analytics',
    signals: ['analytics/visitors', 'funnel/signups', 'funnel/paid_activations'],
    cards: [
      { id: 'cf1', type: 'stat', title: 'Conversion Rate', subtitle: 'Visitor to paid subscription', cols: 1, value: '4.82%', delta: '+0.6%', accentColor: 'sky' },
      { id: 'cf2', type: 'progress', title: 'Onboarding Completion', subtitle: 'Activation milestone rate', cols: 1, value: 84, delta: '84%', accentColor: 'sky' },
      { id: 'cf3', type: 'waterfall', title: 'Full-Funnel Drop-Off', subtitle: 'Acquisition to retention stages', cols: 2, value: '100k', accentColor: 'sky', config: { bars: [{ name: 'Impressions', val: 100, d: '100k' }, { name: 'Signups', val: 32, d: '32k' }, { name: 'Active Trial', val: 18, d: '18k' }, { name: 'Paid', val: 4.8, d: '4.8k' }] } }
    ],
    solaCode: `<script>
  let conversionRate = $state(4.82);
  let activation = $state(84);
</script>

<div class="funnel-hud">
  <h2>Conversion: {conversionRate}%</h2>
  <p>Activation: {activation}%</p>
</div>`
  },
  {
    id: 'global-payout-velocity',
    name: 'Global Payout & Treasury Velocity',
    category: 'SaaS & Analytics',
    tagline: 'Multi-currency settlement monitor with liquidity indicators',
    description: 'Tracks daily disbursement volumes, currency conversion spreads, and settlement reserve margins.',
    badge: 'Treasury',
    signals: ['treasury/balance', 'settlement/volume', 'fx/spread'],
    cards: [
      { id: 'gp1', type: 'stat', title: 'Settlement Balance', subtitle: 'Available liquidity pool', cols: 1, value: '$1.42M', delta: '+$240k', accentColor: 'emerald' },
      { id: 'gp2', type: 'slider', title: 'Liquidity Reserve Threshold', subtitle: 'Auto-sweep trigger margin', cols: 1, value: 75, accentColor: 'emerald' },
      { id: 'gp3', type: 'chart', title: 'Daily Disbursement Velocity', subtitle: 'Settlement run rate', cols: 2, value: '$340k/day', accentColor: 'emerald' }
    ],
    solaCode: `<script>
  let balance = $state(1420000);
  let reserve = $state(75);
</script>

<div class="treasury-card">
  <h2>Balance: \${(balance / 1000000).toFixed(2)}M</h2>
  <span>Reserve Margin: {reserve}%</span>
</div>`
  },

  // --- Category: Developer & AI ---
  {
    id: 'api-gateway-dial',
    name: 'API Gateway Rate Limiter & Token Dial',
    category: 'Developer & AI',
    tagline: 'Haptic rotary throttle and token bucket saturation monitor',
    description: 'Live rate limit governance HUD with real-time throughput dial, token bucket status, and latency counters.',
    badge: 'Developer',
    signals: ['gateway/throughput', 'rate_limit/bucket_depth', 'network/p99'],
    cards: [
      { id: 'gw1', type: 'radial_dial', title: 'Ingress Rate Throttle', subtitle: 'Dynamic RPS cap adjuster', cols: 1, value: 65, accentColor: 'emerald' },
      { id: 'gw2', type: 'stat', title: 'Ingress Latency p99', subtitle: 'Global edge median', cols: 1, value: '14.2ms', delta: '-2.1ms', accentColor: 'emerald' },
      { id: 'gw3', type: 'code', title: 'Signal Rate Limiter Hook', subtitle: 'Zero-VDOM edge handler', cols: 2, value: 'TypeScript', accentColor: 'slate' },
      { id: 'gw4', type: 'chart', title: 'Live Ingress Requests', subtitle: 'Telemetry throughput', cols: 2, value: '1,420 req/s', accentColor: 'emerald' }
    ],
    solaCode: `<script>
  let rpsLimit = $state(6500);
  let p99 = $state(14.2);
</script>

<div class="gateway-hud">
  <SolaRadialDial bind:value={rpsLimit} />
  <span>p99 Latency: {p99}ms</span>
</div>`
  },
  {
    id: 'llm-prompt-workbench',
    name: 'LLM Prompt Studio & Token Ingress',
    category: 'Developer & AI',
    tagline: 'Real-time prompt engineering console with token streaming and latency metrics',
    description: 'Configurable AI prompt evaluator with parameter sliders (temperature, top-p), token velocity, and response cost indicators.',
    badge: 'AI Engine',
    signals: ['ai/token_velocity', 'ai/cost_per_query', 'ai/ttft_latency'],
    cards: [
      { id: 'ai1', type: 'stat', title: 'Time to First Token (TTFT)', subtitle: 'Streaming response latency', cols: 1, value: '142ms', delta: '-18ms', accentColor: 'violet' },
      { id: 'ai2', type: 'slider', title: 'Temperature Control', subtitle: 'Creativity variance parameter', cols: 1, value: 70, accentColor: 'violet' },
      { id: 'ai3', type: 'code', title: 'Streaming Response Buffer', subtitle: 'Direct reactive text node binding', cols: 2, value: 'Prompt Output', accentColor: 'slate' },
      { id: 'ai4', type: 'chart', title: 'Token Consumption Stream', subtitle: 'Ingress vs Egress throughput', cols: 2, value: '3,800 tok/s', accentColor: 'violet' }
    ],
    solaCode: `<script>
  let ttft = $state(142);
  let temp = $state(0.7);
</script>

<div class="ai-workbench">
  <h3>TTFT: {ttft}ms</h3>
  <p>Temperature: {temp}</p>
</div>`
  },
  {
    id: 'kinetic-node-topology',
    name: 'Kinetic Microservice Mesh & Topology',
    category: 'Developer & AI',
    tagline: 'Self-clustering interactive node graph representing distributed services',
    description: 'Visualizes microservice interconnection, shard replication lag, and network partition states with zero layout lag.',
    badge: 'Architecture',
    signals: ['mesh/nodes_healthy', 'mesh/replication_lag', 'mesh/tps'],
    cards: [
      { id: 'kn1', type: 'node_graph', title: 'Distributed Cluster Graph', subtitle: 'Auto-balancing service nodes', cols: 2, value: '18 Nodes', accentColor: 'emerald' },
      { id: 'kn2', type: 'stat', title: 'Mesh Health Index', subtitle: 'Global cluster status', cols: 1, value: '99.98%', delta: 'Optimal', accentColor: 'emerald' }
    ],
    solaCode: `<script>
  let nodeCount = $state(18);
  let healthIndex = $state(99.98);
</script>

<div class="node-mesh">
  <h3>Mesh Nodes: {nodeCount}</h3>
  <p>Health: {healthIndex}%</p>
</div>`
  },

  // --- Category: Commerce & Retail ---
  {
    id: 'ecommerce-order-flow',
    name: 'Storefront Order Fulfillment Pipeline',
    category: 'Commerce & Retail',
    tagline: 'Real-time order intake, inventory reservation, and dispatch pipeline',
    description: 'End-to-end commerce operations console tracking active checkout sessions, payment settlement, and shipping queues.',
    badge: 'Commerce',
    signals: ['store/gross_orders', 'store/fulfillment_rate', 'store/active_carts'],
    cards: [
      { id: 'ec1', type: 'stat', title: 'Today Gross Merchandise Value', subtitle: 'Real-time checkout volume', cols: 1, value: '$42,850', delta: '+22.4%', accentColor: 'amber' },
      { id: 'ec2', type: 'progress', title: 'Fulfillment Target SLA', subtitle: 'Same-day dispatch speed', cols: 1, value: 92, delta: '92%', accentColor: 'amber' },
      { id: 'ec3', type: 'table', title: 'Live Order Intake Stream', subtitle: 'Recent buyer transactions', cols: 2, value: 'Orders', accentColor: 'slate' },
      { id: 'ec4', type: 'feed', title: 'Warehouse Dispatch Stream', subtitle: 'Real-time packing events', cols: 1, value: 'Active', accentColor: 'slate' }
    ],
    solaCode: `<script>
  let gmv = $state(42850);
  let fulfillment = $state(92);
</script>

<div class="commerce-hud">
  <h2>Today GMV: \${gmv.toLocaleString()}</h2>
  <p>Fulfillment SLA: {fulfillment}%</p>
</div>`
  },
  {
    id: 'inventory-stock-matrix',
    name: 'Multi-Warehouse Inventory & Reorder Matrix',
    category: 'Commerce & Retail',
    tagline: 'Dynamic stock levels with automated reorder thresholds and depletion gauges',
    description: 'Monitors regional warehouse SKUs, low-stock threshold triggers, and incoming supplier lead times.',
    badge: 'Logistics',
    signals: ['inventory/sku_count', 'inventory/reorder_alerts', 'logistics/lead_time'],
    cards: [
      { id: 'iv1', type: 'stat', title: 'Total Managed SKUs', subtitle: 'Across 4 global hubs', cols: 1, value: '12,480', delta: '+140 new', accentColor: 'slate' },
      { id: 'iv2', type: 'progress', title: 'Warehouse Capacity Utilization', subtitle: 'Main distribution center', cols: 1, value: 78, delta: '78%', accentColor: 'amber' },
      { id: 'iv3', type: 'table', title: 'Depletion Watchlist Table', subtitle: 'Low-stock reorder triggers', cols: 2, value: 'Stock Records', accentColor: 'slate' }
    ],
    solaCode: `<script>
  let totalSkus = $state(12480);
  let capacity = $state(78);
</script>

<div class="inventory-card">
  <h3>SKUs: {totalSkus}</h3>
  <p>Capacity: {capacity}%</p>
</div>`
  },

  // --- Category: Productivity & Tasks ---
  {
    id: 'sprint-velocity-horizon',
    name: 'Engineering Sprint Velocity & Task Horizon',
    category: 'Productivity & Tasks',
    tagline: 'Tactile sprint tracking board with calendar date filters and burndown charts',
    description: 'Sprint planning and velocity workspace tracking story points, pull request turnaround time, and release milestones.',
    badge: 'Productivity',
    signals: ['sprint/velocity', 'sprint/completed_points', 'pr/review_latency'],
    cards: [
      { id: 'sp1', type: 'stat', title: 'Sprint Velocity', subtitle: 'Completed story points', cols: 1, value: '64 pts', delta: '+12 pts', accentColor: 'emerald' },
      { id: 'sp2', type: 'datepicker', title: 'Sprint Milestone Horizon', subtitle: 'Target ship deadline', cols: 1, value: '2026-09-15', accentColor: 'emerald' },
      { id: 'sp3', type: 'table', title: 'Active Pull Requests', subtitle: 'Pending code review queue', cols: 2, value: 'PR Queue', accentColor: 'slate' },
      { id: 'sp4', type: 'chart', title: 'Burndown Progression', subtitle: 'Points remaining vs ideal trajectory', cols: 2, value: 'Burndown', accentColor: 'emerald' }
    ],
    solaCode: `<script>
  let points = $state(64);
  let shipDate = $state("2026-09-15");
</script>

<div class="sprint-board">
  <h2>Sprint Points: {points}</h2>
  <span>Target Ship: {shipDate}</span>
</div>`
  },
  {
    id: 'habit-streak-matrix',
    name: 'Habit Consistency & Momentum Rings',
    category: 'Productivity & Tasks',
    tagline: 'Zero-friction daily activity logger with spring-loaded progress rings',
    description: 'Personal habit and discipline tracker with visual completion rings, streak counters, and weekly consistency grids.',
    badge: 'Habits',
    signals: ['habits/daily_completed', 'habits/streak_days', 'habits/consistency_rate'],
    cards: [
      { id: 'hb1', type: 'progress', title: 'Daily Goal Completion', subtitle: '4 of 5 habits checked', cols: 1, value: 80, delta: '80%', accentColor: 'emerald' },
      { id: 'hb2', type: 'stat', title: 'Current Streak', subtitle: 'Unbroken daily execution', cols: 1, value: '28 Days', delta: '+1 day', accentColor: 'emerald' },
      { id: 'hb3', type: 'feed', title: 'Recent Logged Activities', subtitle: 'Real-time habit completions', cols: 1, value: 'Active', accentColor: 'slate' }
    ],
    solaCode: `<script>
  let completion = $state(80);
  let streak = $state(28);
</script>

<div class="habit-tracker">
  <h3>Goal: {completion}%</h3>
  <p>Streak: {streak} Days</p>
</div>`
  },

  // --- Category: Operations & Health ---
  {
    id: 'multi-region-cluster-mesh',
    name: 'Multi-Region Infrastructure & NOC Sentinel',
    category: 'Operations & Health',
    tagline: 'High-density operations console with node shard matrix and incident escalations',
    description: 'Central operations center tracking global data center clusters, p99 ingress latency, and failover status.',
    badge: 'NOC Ops',
    signals: ['cluster/global_uptime', 'cluster/shards_active', 'noc/active_incidents'],
    cards: [
      { id: 'noc1', type: 'stat', title: 'Global System Availability', subtitle: '30-day trailing uptime', cols: 1, value: '99.994%', delta: 'Zero Incidents', accentColor: 'emerald' },
      { id: 'noc2', type: 'stat', title: 'p99 Ingress Latency', subtitle: 'Edge CDN routing', cols: 1, value: '4.2ms', delta: '-0.4ms', accentColor: 'emerald' },
      { id: 'noc3', type: 'node_graph', title: 'Global Regional Nodes', subtitle: 'Auto-clustering edge nodes', cols: 2, value: 'Clusters', accentColor: 'emerald' },
      { id: 'noc4', type: 'feed', title: 'System Event Stream', subtitle: 'Live failover audit logs', cols: 1, value: 'Optimal', accentColor: 'slate' }
    ],
    solaCode: `<script>
  let uptime = $state(99.994);
  let latency = $state(4.2);
</script>

<div class="noc-sentinel">
  <h1>Availability: {uptime}%</h1>
  <p>p99 Latency: {latency}ms</p>
</div>`
  }
];
