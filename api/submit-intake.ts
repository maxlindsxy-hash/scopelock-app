export const config = { runtime: 'edge' };

declare const process: { env: Record<string, string | undefined> };

function generateSessionId(): string {
  return `intake-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body || typeof body !== 'object') {
    return new Response(JSON.stringify({ error: 'Missing body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { tenantId, transcript } = body as Record<string, unknown>;

  if (!tenantId || typeof tenantId !== 'string') {
    return new Response(JSON.stringify({ error: 'tenantId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!transcript || typeof transcript !== 'object') {
    return new Response(JSON.stringify({ error: 'transcript is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionId = generateSessionId();
  const submittedAt = new Date().toISOString();

  // ── Persistence stub ──────────────────────────────────────────────────────────
  // TODO: Replace with Vercel KV once provisioned:
  //
  //   import { kv } from '@vercel/kv';
  //   await kv.set(
  //     `intake:${tenantId}:${sessionId}`,
  //     { tenantId, sessionId, submittedAt, transcript },
  //     { ex: 60 * 60 * 24 * 90 }  // 90-day TTL
  //   );
  //   await kv.lpush(`intake:${tenantId}:index`, sessionId);
  //
  // For now, the submission is acknowledged and logged server-side only.
  // ─────────────────────────────────────────────────────────────────────────────

  console.log(`[submit-intake] tenantId=${tenantId} sessionId=${sessionId} at=${submittedAt}`);

  return new Response(
    JSON.stringify({ success: true, sessionId, submittedAt }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
