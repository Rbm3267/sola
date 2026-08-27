import { json } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export async function POST({ request }) {
  try {
    const data = await request.json();
    const prompt = data.intent;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing.');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: "You are the Aura generative UI engine. You support everything from world-class design systems to premium enterprise dashboards. Based on the user's intent, respond with a valid JSON payload that dictates which UI component to render.\nThe available components are: 'DataCard', 'DynamicForm', 'ListBlock'.\nFor DataCard, config needs: title, value, trend, icon (e.g. activity, check, heart, coffee, laptop).\nFor DynamicForm, config needs: title, endpoint (string), fields (array of {name, type, label, required}).\nFor ListBlock, config needs: title, items (array of {label, description, status(string optional)}).\nOutput ONLY valid JSON matching this schema: [ { component: string, config: object } ]. You can return an array of multiple components! If the user asks 'what can you do' or implies a dashboard, show off by returning an array of multiple DIFFERENT components (e.g. a DataCard, a ListBlock, AND a DynamicForm) so they can see them all working at once.\n\nUser Intent: " + prompt,
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



