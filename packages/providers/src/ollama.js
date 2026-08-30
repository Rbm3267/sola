import { streamingResponse, jsonResponse, errorResponse, toExpress } from './utils.js';

/**
 * Ollama local model provider for Sola AIR.
 * Runs entirely on-device — no API key needed.
 *
 * @example
 * import { OllamaProvider } from '@sola-air-ui/providers/ollama'
 * const provider = OllamaProvider({ model: 'llama3.2' })
 * export const POST = provider.handler
 */
export function OllamaProvider({
  model = 'llama3.2',
  baseURL = 'http://localhost:11434'
} = {}) {
  async function handler(request) {
    try {
      const { messages, model: reqModel, stream = false } = await request.json();

      const res = await fetch(`${baseURL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: reqModel || model,
          messages,
          stream
        })
      });

      if (!res.ok) {
        const err = await res.text();
        return errorResponse(err, res.status);
      }

      if (stream) {
        return streamingResponse(_parseOllamaStream(res));
      }

      const data = await res.json();
      const text = data.message?.content ?? '';
      return jsonResponse(text);
    } catch (err) {
      return errorResponse(err.message);
    }
  }

  return { handler, express: toExpress(handler) };
}

async function* _parseOllamaStream(res) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    // Ollama streams newline-delimited JSON, not SSE
    const lines = buf.split('\n');
    buf = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const evt = JSON.parse(line);
        const token = evt.message?.content;
        if (token) yield token;
        if (evt.done) return;
      } catch { /* skip */ }
    }
  }
}
