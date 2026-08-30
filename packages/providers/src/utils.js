// Shared utilities for Sola AIR provider adapters

/**
 * Encode a string chunk as an SSE data line.
 * @param {string} token
 * @returns {Uint8Array}
 */
export function sseToken(token) {
  return encoder.encode(`data: ${JSON.stringify({ token })}\n\n`);
}

export function sseDone() {
  return encoder.encode('data: [DONE]\n\n');
}

const encoder = new TextEncoder();

/**
 * Wrap a Web Request handler to work as an Express middleware.
 * @param {(req: Request) => Promise<Response>} handler
 */
export function toExpress(handler) {
  return async (req, res) => {
    const url = `http://localhost${req.url}`;
    const body = JSON.stringify(req.body);
    const request = new Request(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body
    });
    const response = await handler(request);
    res.status(response.status);
    response.headers.forEach((v, k) => res.setHeader(k, v));
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const text = await response.text();
      res.send(text);
    }
  };
}

/**
 * Build a streaming Response from an async generator that yields string tokens.
 * @param {AsyncGenerator<string>} tokenGen
 * @returns {Response}
 */
export function streamingResponse(tokenGen) {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const token of tokenGen) {
          controller.enqueue(sseToken(token));
        }
        controller.enqueue(sseDone());
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

/**
 * Build a JSON Response for non-streaming replies.
 * @param {string} result
 * @returns {Response}
 */
export function jsonResponse(result) {
  return new Response(JSON.stringify({ result }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
