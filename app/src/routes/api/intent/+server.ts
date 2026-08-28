import { json } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return json({ 
        reply: "Sola Arc is running in sovereign offline mode. Sola components compile directly into native reactive DOM nodes via @sola/compiler with zero-VDOM signals. For live AI synthesis, configure GEMINI_API_KEY in your environment." 
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Mode 1: Sola Architect (Free-Form Solutions Architect & Framework Consultant)
    if (data.mode === 'architect' || data.query) {
      const query = (data.query || data.intent || '').trim();
      if (!query || query.length > 2000) {
        return json({ error: 'Invalid query. Maximum length is 2000 characters.' }, { status: 400 });
      }

      const architectSystemPrompt = `You are **Sola Arc**, the autonomous Principal UI & Systems Solutions Architect for the Sola Reactive Runtime ecosystem (@sola/core, @sola/ui, @sola/compiler, @sola/relay).

Your Mission:
1. Explain how Sola embeds and modernizes existing web applications (React 19, Next.js App Router, Svelte 5, Vue 3, Angular, or legacy enterprise platforms like ServiceNow, Stripe, Jira, and custom monoliths).
2. Answer "How would this work in my UI?" with concrete architectural guidance, Shadow DOM isolation strategies, and exact copy-paste integration code snippets.
3. Explain the Zero-VDOM 3.2 kB Signal Mesh (@sola/core) and how fine-grained signals eliminate virtual DOM reconciliation overhead and re-rendering lag.
4. Show developers how to eliminate "No-Code React Form Pain" using Sola's declarative DynamicForm and DataCard schemas that configure from UI with 0 code changes.
5. Provide guidance on the Sola Chrome Extension (Live Browser Overlay) for in-situ sandbox testing without production deployments.

Formatting:
- Structure your response with crisp markdown headers, bullet points, and syntax-highlighted code blocks (javascript, typescript, svelte, or bash).
- Write production-grade, concise code snippets.
- Maintain a world-class, confident, Apple / Linear / Stripe level polish.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: architectSystemPrompt + "\n\nUser Question: " + query,
        config: {
          temperature: 0.3
        }
      });

      return json({ reply: response.text || 'I am ready to architect your Sola integration.' });
    }

    // Mode 2: Generative UI Intent Compiler (JSON Component AST)
    const prompt = (data.intent || '').trim();
    if (!prompt || prompt.length > 1000) {
      return json({ error: 'Invalid intent query. Maximum length is 1000 characters.' }, { status: 400 });
    }

    const systemInstruction = `You are Sola's generative UI intent compiler.
You synthesize world-class, luxury UI surfaces (Linear, Stripe, Apple Fitness grade polish).
Given a user intent, output a structured JSON array of components to render.

Available Primitives:
1. 'DataCard': KPI metric tile.
   config: { title: string, value: string, trend: string, icon: 'activity' | 'trending-up' | 'check' | 'heart' }
2. 'GaugeCard': Circular SVG progress arc for load, recovery, memory, or SLA.
   config: { title: string, value: string, percentage: number (0-100), subtext: string, color: 'amber' | 'emerald' | 'sky' | 'violet' }
3. 'DynamicForm': Schema-driven auto-binding form.
   config: { title: string, endpoint: string, fields: Array<{ name: string, type: 'text' | 'number' | 'email' | 'password', label: string, required?: boolean }> }
4. 'ListBlock': Real-time reactive entity list.
   config: { title: string, items: Array<{ label: string, description: string, status: 'Active' | 'Completed' | 'Syncing' | 'Offline' }> }
5. 'StreamView': Real-time telemetry log feed.
   config: { title: string, events: Array<{ id: string, message: string, timestamp: string, type: 'info' | 'success' | 'warning' }> }
6. 'ClusterMatrix': High-density distributed node matrix and cluster health grid.
   config: { title: string, subtitle?: string, nodes: Array<{ id: string, label: string, status: 'nominal' | 'warning' | 'critical' | 'draining' | 'idle', load?: number, latency?: string, region?: string }> }
7. 'DiffAudit': Enterprise Change review diff with 1-click approvals.
   config: { title: string, entityId: string, entityType: string, riskLevel: 'Low' | 'Moderate' | 'High' | 'Destructive', riskScore: number, requester: string, window: string, diffLines: Array<{ type: 'add' | 'remove' | 'context', content: string }> }
8. 'FlowWaterfall': Financial revenue realization and latency breakdown.
   config: { title: string, subtitle?: string, steps: Array<{ id: string, name: string, delta: number, type: 'start' | 'credit' | 'debit' | 'total', formattedValue: string }> }
9. 'IncidentTriageMatrix': Mission-control P1 emergency incident triage capsule with countdown timer.
   config: { incidentId: string, title: string, severity: 'P1 - Critical' | 'P2 - High' | 'P3 - Moderate', slaRemainingMin: number, blastRadius: string, playbooks: Array<{ id: string, title: string, action: string, automated?: boolean }> }
10. 'SchemaInspector': Database table schema explorer with types, row counts, and foreign key relations.
   config: { table: string, rowCount?: string, sizeBytes?: string, columns: Array<{ name: string, type: string, isPrimary?: boolean, isNullable?: boolean, foreignKey?: string }> }

Output format: Return ONLY a JSON Array of component objects with an optional colSpan (1, 2, or 3).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemInstruction + "\n\nUser Intent: " + prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    let parsed = JSON.parse(response.text || '[]');
    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }

    return json(parsed);

  } catch (err: any) {
    console.error('AI Intent Error:', err);
    return json({ error: err.message || 'Failed to process AI request' }, { status: 500 });
  }
}
