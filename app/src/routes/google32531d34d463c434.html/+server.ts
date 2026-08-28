import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
  return new Response('google-site-verification: google32531d34d463c434.html', {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
