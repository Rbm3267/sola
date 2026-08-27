import { json } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '$env/static/private';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const prompt = data.intent;

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing.');
    }

    if (typeof prompt !== 'string' || prompt.trim().length === 0 || prompt.length > 1000) {
      return json({ error: 'Invalid intent query. Maximum length is 1000 characters.' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const cleanPrompt = prompt.trim();

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

Output format: Return ONLY a JSON Array of component objects with an optional colSpan (1, 2, or 3).
Example:
[
  { "component": "DataCard", "colSpan": 1, "config": { "title": "Revenue", "value": "$48,200", "trend": "+12.4%", "icon": "trending-up" } },
  { "component": "GaugeCard", "colSpan": 1, "config": { "title": "SLA Compliance", "value": "99.4%", "percentage": 99, "subtext": "MTTR < 15m", "color": "emerald" } }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: systemInstruction + "\n\nUser Intent: " + cleanPrompt,
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
    return json({ error: err.message || 'Failed to compile intent AST' }, { status: 500 });
  }
}
