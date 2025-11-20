// frontend/app/api/ai/chat/stream/route.ts
// Proxy route that forwards POST requests to the backend AI streaming endpoint
// and relays the streaming response back to the client.

import type { NextRequest } from 'next/server';

// Optional: if you want edge runtime change to `export const runtime = 'edge';`
// but Node runtime is fine for streaming proxies in many setups.

export async function POST(req: Request) {
  // Determine backend base URL from env (set in frontend/.env or hosting env)
  const backendBase =
    process.env.NEXT_PUBLIC_BACKEND || process.env.BACKEND || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const backendUrl = `${backendBase.replace(/\/+$/, '')}/api/ai/chat/stream`;

  // Forward incoming headers we care about (content-type, authorization)
  const headers: Record<string, string> = {};
  const incomingContentType = req.headers.get('content-type');
  if (incomingContentType) headers['Content-Type'] = incomingContentType;
  const auth = req.headers.get('authorization') || req.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;

  // Read the incoming body as a stream/text and forward it.
  // We don't assume JSON-only; pass-through the raw body.
  const body = await (async () => {
    try {
      return await req.text();
    } catch (e) {
      return undefined;
    }
  })();

  // Proxy the request to backend
  const backendRes = await fetch(backendUrl, {
    method: 'POST',
    headers,
    body,
    // keep credentials/cors/etc behaviour default for server-side fetch
  });

  // If backend responded with non-OK and no body, return status and JSON body (if possible)
  if (!backendRes.ok && !backendRes.body) {
    let errBody: any = null;
    try {
      errBody = await backendRes.json();
    } catch (e) {
      errBody = await backendRes.text().catch(() => null);
    }
    return new Response(JSON.stringify({ error: errBody }), { status: backendRes.status, headers: { 'Content-Type': 'application/json' } });
  }

  // Pass through most headers; drop hop-by-hop / encoding headers that may interfere
  const resHeaders = new Headers(backendRes.headers as any);
  // Remove content-encoding so the client can decode chunks properly (optional)
  resHeaders.delete('content-encoding');
  // Prevent streaming issues with transfer-encoding on some platforms
  resHeaders.delete('transfer-encoding');

  // Stream backend response body directly back to client
  return new Response(backendRes.body, {
    status: backendRes.status,
    headers: resHeaders,
  });
}

export const runtime = 'nodejs';
