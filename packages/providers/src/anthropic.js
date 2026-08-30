import { streamingResponse, jsonResponse, errorResponse, toExpress } from './utils.js';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

/**
 * Anthropic Claude provider for Sola AIR.
 *
 * @example
 * // Next.js App Router / SvelteKit / Cloudflare Workers
 * import { AnthropicProvider } from '@sola-air-ui/providers/anthropic'
 * const provider = AnthropicProvider({ apiKey: process.env.ANTHROPIC_KEY })
 * export const POST = provider.handler
 *
 * // Express
 * app.post('/api/ai', provider.express)
 */
export function AnthropicProvider({
  apiKey,
  model = 'claude-sonnet-5',
  maxTokens = 4096,
  system
} = {}) {
  async function handler(request) {
    try {
      const { messages, model: reqModel, stream = false } = await request.json();

      const body = {
        model: reqModel || model,
        max_tokens: maxTokens,
        messages,
        stream,
        ...(system ? { system } : {})
      };

      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.text();
        return errorResponse(err, res.status);
      }

      if (stream) {
        return streamingResponse(_parseAnthropicStream(res));
      }

      const data = await res.json();
      const text = data.content?.[0]?.text ?? '';
      return jsonResponse(text);
    } catch (err) {
      return errorResponse(err.message);
    }
  }

  return { handler, express: toExpress(handler) };
}

async function* _parseAnthropicStream(res) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const lines = buf.split('\n');
    buf = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') return;
      try {
        const evt = JSON.parse(payload);
        // content_block_delta carries the streaming text
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
          yield evt.delta.text;
        }
      } catch { /* skip malformed */ }
    }
  }
}
