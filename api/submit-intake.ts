export const config = { runtime: 'edge' };

declare const process: { env: Record<string, string | undefined> };

function generateSessionId(): string {
  return `intake-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function kvAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvSet(key: string, value: unknown): Promise<void> {
  const url = `${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`;
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  });
}

async function kvLPush(key: string, value: string): Promise<void> {
  const url = `${process.env.KV_REST_API_URL}/lpush/${encodeURIComponent(key)}`;
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { tenantId, transcript } = (body ?? {}) as Record<string, unknown>;

  if (!tenantId || typeof tenantId !== 'string') {
    return new Response(JSON.stringify({ error: 'tenantId is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (!transcript || typeof transcript !== 'object') {
    return new Response(JSON.stringify({ error: 'transcript is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  const t = transcript as Record<string, unknown>;
  if (!t.q1_spaces || typeof t.q1_spaces !== 'string' || !String(t.q1_spaces).trim()) {
    return new Response(JSON.stringify({ error: 'Transcript has no content' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const sessionId = generateSessionId();
  const submittedAt = new Date().toISOString();
  const submission = { sessionId, tenantId, submittedAt, transcript };

  if (kvAvailable()) {
    try {
      await kvSet(`intake:${tenantId}:${sessionId}`, submission);
      await kvLPush(`intake:${tenantId}:index`, sessionId);
    } catch (err) {
      console.error('[submit-intake] KV write failed:', err);
    }
  } else {
    console.log(`[submit-intake] KV not provisioned — tenantId=${tenantId} sessionId=${sessionId} at=${submittedAt}`);
  }

  return new Response(
    JSON.stringify({ success: true, sessionId, submittedAt }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
}
