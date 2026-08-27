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

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    if (typeof prompt !== 'string' || prompt.trim().length === 0 || prompt.length > 500) {
      return json({ error: 'Invalid intent query. Maximum length is 500 characters.' }, { status: 400 });
    }

    const cleanPrompt = prompt.replace(/[^\w\s.,?!'-]/gi, ' ').trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: "You are the Sola generative UI engine. You produce world-class, luxury cyber-fitness enterprise UI surfaces (Apple Fitness / Linear / Stripe grade polish). Based on the user's intent, respond with a valid JSON payload that dictates which UI component(s) to render.\nThe available components are:\n- 'DataCard': config needs: title, value, trend (e.g. '+14.2%'), icon ('activity' | 'trending-up' | 'check' | 'heart').\n- 'GaugeCard': for CPU, memory, load, or percentage gauges. config needs: title, value (e.g. '14.2 / 16 GB' or '78.4%'), percentage (number 0-100), subtext, color ('emerald' | 'sky' | 'violet' | 'amber').\n- 'DynamicForm': config needs: title, endpoint (string), fields (array of {name, type, label, required}).\n- 'ListBlock': config needs: title, items (array of {label, description, status ('Active' | 'Syncing' | 'Offline')}).\n\nOutput ONLY valid JSON matching: [ { component: string, config: object } ]. Return multi-component layouts when appropriate.\n\nUser Intent: " + cleanPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    return json(JSON.parse(response.text));

  } catch (err: any) {
    console.error('AI Error:', err);
    return json({ error: err.message || 'Failed to process intent' }, { status: 500 });
  }
}



