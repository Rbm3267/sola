export interface ComponentPropSpec {
  name: string;
  type: string;
  defaultValue: any;
  description: string;
  options?: string[];
}

export interface CatalogComponent {
  id: string;
  name: string;
  category: 'Metrics & KPIs' | 'Gauges & Rings' | 'Controllers & Sliders' | 'Flows & Cascades' | 'Lists & Feeds' | 'Matrices & Graphs' | 'Forms & Inputs' | 'Status & HUD';
  description: string;
  tagline: string;
  badge?: string;
  componentName: string;
  defaultConfig: Record<string, any>;
  props: ComponentPropSpec[];
  codeSnippets: {
    sola: string;
    react: string;
    svelte: string;
    html: string;
  };
}

export const COMPONENT_CATALOG: CatalogComponent[] = [
  // 1. MetricCard
  {
    id: 'metric-card',
    name: 'Metric Card',
    category: 'Metrics & KPIs',
    description: 'Primary KPI metric tile with configurable numerical value, delta trend percentage, and clean vector icon.',
    tagline: 'High-density statistics and key performance indicators',
    badge: 'Foundational',
    componentName: 'DataCard',
    defaultConfig: {
      title: 'Net Revenue Retention',
      value: '138.4%',
      trend: '+12.6% vs target',
      icon: 'activity',
      accentColor: 'emerald'
    },
    props: [
      { name: 'title', type: 'string', defaultValue: 'Metric Title', description: 'Label displayed at the top of the card' },
      { name: 'value', type: 'string', defaultValue: '$184,200', description: 'Primary prominent metric value' },
      { name: 'trend', type: 'string', defaultValue: '+14.2%', description: 'Subtext or trend percentage badge' },
      { name: 'icon', type: 'string', defaultValue: 'activity', description: 'Vector icon glyph identifier', options: ['activity', 'trending-up', 'check-circle', 'zap', 'shield'] }
    ],
    codeSnippets: {
      sola: `<DataCard \n  title="Net Revenue Retention"\n  value="138.4%"\n  trend="+12.6% vs target"\n  icon="activity"\n/>`,
      react: `import { DataCard } from '@sola/ui';\n\nexport function KPIWidget() {\n  return (\n    <DataCard\n      title="Net Revenue Retention"\n      value="138.4%"\n      trend="+12.6% vs target"\n      icon="activity"\n    />\n  );\n}`,
      svelte: `<script>\n  import { DataCard } from '@sola/ui';\n</script>\n\n<DataCard config={{\n  title: "Net Revenue Retention",\n  value: "138.4%",\n  trend: "+12.6% vs target",\n  icon: "activity"\n}} />`,
      html: `<sola-data-card\n  title="Net Revenue Retention"\n  value="138.4%"\n  trend="+12.6% vs target"\n  icon="activity"\n></sola-data-card>`
    }
  },

  // 2. GaugeCard
  {
    id: 'gauge-ring',
    name: 'Progress Gauge Ring',
    category: 'Gauges & Rings',
    description: 'SVG circular ring gauge with smooth animated strokes, percentage calculation, and ambient status color.',
    tagline: 'Radial capacity indicators and milestone progress rings',
    badge: 'Vector SVG',
    componentName: 'GaugeCard',
    defaultConfig: {
      title: 'Target SLA Utilization',
      value: '94.2%',
      percentage: 94,
      subtext: 'Optimal threshold: 90%',
      color: 'emerald'
    },
    props: [
      { name: 'title', type: 'string', defaultValue: 'Utilization', description: 'Card title' },
      { name: 'percentage', type: 'number', defaultValue: 86, description: 'Progress percentage (0 - 100)' },
      { name: 'value', type: 'string', defaultValue: '86%', description: 'Centered display string' },
      { name: 'subtext', type: 'string', defaultValue: 'Normal range', description: 'Contextual sub-label' },
      { name: 'color', type: 'string', defaultValue: 'emerald', description: 'Ring accent color', options: ['emerald', 'sky', 'amber', 'violet', 'rose'] }
    ],
    codeSnippets: {
      sola: `<GaugeCard\n  title="Target SLA Utilization"\n  percentage={94}\n  value="94.2%"\n  color="emerald"\n/>`,
      react: `import { GaugeCard } from '@sola/ui';\n\nexport function CapacityGauge() {\n  return (\n    <GaugeCard\n      title="Target SLA Utilization"\n      percentage={94}\n      value="94.2%"\n      color="emerald"\n    />\n  );\n}`,
      svelte: `<script>\n  import { GaugeCard } from '@sola/ui';\n</script>\n\n<GaugeCard config={{\n  title: "Target SLA Utilization",\n  percentage: 94,\n  value: "94.2%",\n  color: "emerald"\n}} />`,
      html: `<sola-gauge-card\n  title="Target SLA Utilization"\n  percentage="94"\n  value="94.2%"\n  color="emerald"\n></sola-gauge-card>`
    }
  },

  // 3. TactileDialCard
  {
    id: 'tactile-dial',
    name: 'Rotary Dial Controller',
    category: 'Controllers & Sliders',
    description: 'Physical rotary dial with drag/wheel rotational mechanics, spring physics, and real-time reactive signal binding.',
    tagline: 'Tactile rotary controllers and haptic adjustment dials',
    badge: 'Interactive',
    componentName: 'TactileDialCard',
    defaultConfig: {
      title: 'Bandwidth Rate Limiter',
      metric: '48 Nodes',
      min: 1,
      max: 100,
      currentValue: 48,
      unit: 'Active Allocation'
    },
    props: [
      { name: 'title', type: 'string', defaultValue: 'Throttle Controller', description: 'Dial label' },
      { name: 'metric', type: 'string', defaultValue: '48 Units', description: 'Formatted value display' },
      { name: 'min', type: 'number', defaultValue: 0, description: 'Minimum dial threshold' },
      { name: 'max', type: 'number', defaultValue: 100, description: 'Maximum dial threshold' },
      { name: 'currentValue', type: 'number', defaultValue: 48, description: 'Active rotational value' }
    ],
    codeSnippets: {
      sola: `<TactileDialCard\n  title="Bandwidth Rate Limiter"\n  metric="48 Nodes"\n  min={1}\n  max={100}\n  currentValue={48}\n/>`,
      react: `import { TactileDialCard } from '@sola/ui';\n\nexport function ThrottleControl() {\n  return (\n    <TactileDialCard\n      title="Bandwidth Rate Limiter"\n      min={1}\n      max={100}\n      defaultValue={48}\n      onChange={(val) => console.log('Dial changed:', val)}\n    />\n  );\n}`,
      svelte: `<script>\n  import { TactileDialCard } from '@sola/ui';\n</script>\n\n<TactileDialCard config={{\n  title: "Bandwidth Rate Limiter",\n  metric: "48 Nodes",\n  min: 1,\n  max: 100,\n  currentValue: 48\n}} />`,
      html: `<sola-tactile-dial\n  title="Bandwidth Rate Limiter"\n  min="1"\n  max="100"\n  value="48"\n></sola-tactile-dial>`
    }
  },

  // 4. FlowWaterfall
  {
    id: 'flow-waterfall',
    name: 'Step & Margin Waterfall',
    category: 'Flows & Cascades',
    description: 'Progressive breakdown chart visualizing positive contributions, deductions, and running net balances.',
    tagline: 'Waterfall cascades, pipeline progressions, and margin flows',
    badge: 'Visual Flow',
    componentName: 'FlowWaterfall',
    defaultConfig: {
      title: 'Net Margin Realization',
      steps: [
        { name: 'Gross Revenue Ingress', value: 840000, type: 'positive' },
        { name: 'Cloud Infrastructure & Egress', value: -140000, type: 'negative' },
        { name: 'Zero-VDOM Compute Efficiency', value: 24000, type: 'positive' },
        { name: 'Net Realized Sovereign Margin', value: 724000, type: 'total' }
      ]
    },
    props: [
      { name: 'title', type: 'string', defaultValue: 'Cash Flow Breakdown', description: 'Header title of the waterfall' },
      { name: 'steps', type: 'Array<Step>', defaultValue: [], description: 'Array of steps with name, value, and type (positive/negative/total)' }
    ],
    codeSnippets: {
      sola: `<FlowWaterfall\n  title="Net Margin Realization"\n  steps={[\n    { name: "Gross Ingress", value: 840000, type: "positive" },\n    { name: "Overhead", value: -140000, type: "negative" },\n    { name: "Net Balance", value: 700000, type: "total" }\n  ]}\n/>`,
      react: `import { FlowWaterfall } from '@sola/ui';\n\nexport function MarginChart() {\n  return (\n    <FlowWaterfall\n      title="Net Margin Realization"\n      steps={[\n        { name: "Gross Ingress", value: 840000, type: "positive" },\n        { name: "Overhead", value: -140000, type: "negative" },\n        { name: "Net Balance", value: 700000, type: "total" }\n      ]}\n    />\n  );\n}`,
      svelte: `<script>\n  import { FlowWaterfall } from '@sola/ui';\n</script>\n\n<FlowWaterfall config={{\n  title: "Net Margin Realization",\n  steps: [\n    { name: "Gross Ingress", value: 840000, type: "positive" },\n    { name: "Overhead", value: -140000, type: "negative" },\n    { name: "Net Balance", value: 700000, type: "total" }\n  ]\n}} />`,
      html: `<sola-flow-waterfall title="Net Margin Realization"></sola-flow-waterfall>`
    }
  },

  // 5. ListBlock
  {
    id: 'list-feed',
    name: 'Signal Feed & Activity List',
    category: 'Lists & Feeds',
    description: 'High-density activity feed and key-value list with real-time status pills and clean metadata layout.',
    tagline: 'Event streams, transaction feeds, and status lists',
    badge: 'Reactive Feed',
    componentName: 'ListBlock',
    defaultConfig: {
      title: 'Active Signal Stream',
      items: [
        { label: 'ingress-relay-us-east', description: 'p99 Latency: 4.2ms • 32 Nodes', status: 'Active' },
        { label: 'postgres-primary-pool', description: 'Replication Lag: 0ms • Sync', status: 'Active' },
        { label: 'edge-cache-frankfurt', description: 'Cache Hit Ratio: 98.4%', status: 'Completed' }
      ]
    },
    props: [
      { name: 'title', type: 'string', defaultValue: 'Active Feed', description: 'List block header' },
      { name: 'items', type: 'Array<Item>', defaultValue: [], description: 'List items containing label, description, and status' }
    ],
    codeSnippets: {
      sola: `<ListBlock\n  title="Active Signal Stream"\n  items={[\n    { label: "Worker-01", description: "Healthy", status: "Active" }\n  ]}\n/>`,
      react: `import { ListBlock } from '@sola/ui';\n\nexport function SignalStream() {\n  return (\n    <ListBlock\n      title="Active Signal Stream"\n      items={[\n        { label: "Worker-01", description: "Healthy", status: "Active" }\n      ]}\n    />\n  );\n}`,
      svelte: `<script>\n  import { ListBlock } from '@sola/ui';\n</script>\n\n<ListBlock config={{\n  title: "Active Signal Stream",\n  items: [{ label: "Worker-01", description: "Healthy", status: "Active" }]\n}} />`,
      html: `<sola-list-block title="Active Signal Stream"></sola-list-block>`
    }
  },

  // 6. DynamicForm
  {
    id: 'dynamic-form',
    name: 'Schema-Driven Dynamic Form',
    category: 'Forms & Inputs',
    description: 'Declarative JSON schema-driven form generator with built-in validation, reactive signal binding, and async submission.',
    tagline: 'Zero-code forms, parameter tuners, and wizard inputs',
    badge: 'Schema-Driven',
    componentName: 'DynamicForm',
    defaultConfig: {
      title: 'Cluster Provisioning Schema',
      endpoint: '/api/provision',
      fields: [
        { name: 'cluster_name', label: 'Cluster Identifier', type: 'text', required: true },
        { name: 'node_count', label: 'Max Node Allocation', type: 'number', required: true },
        { name: 'region', label: 'Deployment Region', type: 'text', required: true }
      ]
    },
    props: [
      { name: 'title', type: 'string', defaultValue: 'Configuration Form', description: 'Form title' },
      { name: 'endpoint', type: 'string', defaultValue: '/api/submit', description: 'Form submission endpoint' },
      { name: 'fields', type: 'Array<Field>', defaultValue: [], description: 'Array of form field definitions' }
    ],
    codeSnippets: {
      sola: `<DynamicForm\n  title="Cluster Configuration"\n  endpoint="/api/provision"\n  fields={[\n    { name: "cluster_name", label: "Identifier", type: "text", required: true }\n  ]}\n/>`,
      react: `import { DynamicForm } from '@sola/ui';\n\nexport function ConfigForm() {\n  return (\n    <DynamicForm\n      title="Cluster Configuration"\n      endpoint="/api/provision"\n      fields={[\n        { name: "cluster_name", label: "Identifier", type: "text", required: true }\n      ]}\n    />\n  );\n}`,
      svelte: `<script>\n  import { DynamicForm } from '@sola/ui';\n</script>\n\n<DynamicForm config={{\n  title: "Cluster Configuration",\n  endpoint: "/api/provision",\n  fields: [{ name: "cluster_name", label: "Identifier", type: "text", required: true }]\n}} />`,
      html: `<sola-dynamic-form title="Cluster Configuration"></sola-dynamic-form>`
    }
  },

  // 7. ClusterMatrix
  {
    id: 'cluster-matrix',
    name: 'Multi-Node Topology Matrix',
    category: 'Matrices & Graphs',
    description: 'Multi-region topology status matrix visualizing node health, load percentages, and microsecond latency pips.',
    tagline: 'Infrastructure health grids and cluster matrices',
    badge: 'Topologies',
    componentName: 'ClusterMatrix',
    defaultConfig: {
      title: 'Global Node Topologies',
      clusters: [
        { name: 'us-east-1a (Primary)', status: 'healthy', load: '38%', p99: '8.4ms' },
        { name: 'eu-central-1 (Frankfurt)', status: 'healthy', load: '52%', p99: '14.2ms' },
        { name: 'ap-southeast-1 (Singapore)', status: 'healthy', load: '64%', p99: '21.0ms' }
      ]
    },
    props: [
      { name: 'title', type: 'string', defaultValue: 'Topology Grid', description: 'Matrix title' },
      { name: 'clusters', type: 'Array<Cluster>', defaultValue: [], description: 'Cluster telemetry nodes' }
    ],
    codeSnippets: {
      sola: `<ClusterMatrix\n  title="Global Node Topologies"\n  clusters={[\n    { name: "us-east-1", status: "healthy", load: "38%", p99: "8.4ms" }\n  ]}\n/>`,
      react: `import { ClusterMatrix } from '@sola/ui';\n\nexport function ClusterView() {\n  return (\n    <ClusterMatrix\n      title="Global Node Topologies"\n      clusters={[\n        { name: "us-east-1", status: "healthy", load: "38%", p99: "8.4ms" }\n      ]}\n    />\n  );\n}`,
      svelte: `<script>\n  import { ClusterMatrix } from '@sola/ui';\n</script>\n\n<ClusterMatrix config={{\n  title: "Global Node Topologies",\n  clusters: [{ name: "us-east-1", status: "healthy", load: "38%", p99: "8.4ms" }]\n}} />`,
      html: `<sola-cluster-matrix title="Global Node Topologies"></sola-cluster-matrix>`
    }
  },

  // 8. IncidentTriageMatrix
  {
    id: 'status-radar',
    name: 'Status & Priority Matrix',
    category: 'Status & HUD',
    description: 'High-priority status matrix with severity pill flags, live SLA breach timers, and 1-click action playbooks.',
    tagline: 'Incident command, SLA tracking, and priority triage',
    badge: 'Action Radar',
    componentName: 'IncidentTriageMatrix',
    defaultConfig: {
      title: 'Live Priority Radar',
      description: 'Active triage items staged for automated mitigation',
      incidents: [
        { id: 'TICKET-492', service: 'Authentication Token Gateway', severity: 'P1', status: 'Investigating', latency: '320ms' },
        { id: 'TICKET-495', service: 'Database Connection Pool', severity: 'P2', status: 'Mitigating', latency: '48ms' }
      ]
    },
    props: [
      { name: 'title', type: 'string', defaultValue: 'Status Matrix', description: 'Radar title' },
      { name: 'incidents', type: 'Array<Incident>', defaultValue: [], description: 'Priority items array' }
    ],
    codeSnippets: {
      sola: `<IncidentTriageMatrix\n  title="Live Priority Radar"\n  incidents={[\n    { id: "T-100", service: "Auth API", severity: "P1", status: "Active" }\n  ]}\n/>`,
      react: `import { IncidentTriageMatrix } from '@sola/ui';\n\nexport function PriorityRadar() {\n  return (\n    <IncidentTriageMatrix\n      title="Live Priority Radar"\n      incidents={[\n        { id: "T-100", service: "Auth API", severity: "P1", status: "Active" }\n      ]}\n    />\n  );\n}`,
      svelte: `<script>\n  import { IncidentTriageMatrix } from '@sola/ui';\n</script>\n\n<IncidentTriageMatrix config={{\n  title: "Live Priority Radar",\n  incidents: [{ id: "T-100", service: "Auth API", severity: "P1", status: "Active" }]\n}} />`,
      html: `<sola-incident-triage title="Live Priority Radar"></sola-incident-triage>`
    }
  }
];
