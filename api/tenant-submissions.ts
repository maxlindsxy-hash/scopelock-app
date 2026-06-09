import type { VercelRequest, VercelResponse } from '@vercel/node';

declare const process: { env: Record<string, string | undefined> };

function kvAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvLRange(key: string, start: number, stop: number): Promise<string[]> {
  const url = `${process.env.KV_REST_API_URL}/lrange/${encodeURIComponent(key)}/${start}/${stop}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
  const json = await res.json() as { result: string[] };
  return json.result ?? [];
}

async function kvGet<T>(key: string): Promise<T | null> {
  const url = `${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
  const json = await res.json() as { result: T | null };
  return json.result ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const tenantId = req.query.tenantId;
  if (!tenantId || typeof tenantId !== 'string') {
    return res.status(400).json({ error: 'tenantId query param is required' });
  }

  if (!kvAvailable()) {
    return res.status(503).json({
      error: 'Storage not provisioned',
      hint: 'Provision Vercel KV from the Vercel dashboard → Storage → Create Database → KV, then link it to this project.',
      submissions: [],
    });
  }

  try {
    const sessionIds = await kvLRange(`intake:${tenantId}:index`, 0, 49);
    if (sessionIds.length === 0) {
      return res.status(200).json({ submissions: [] });
    }

    const results = await Promise.all(
      sessionIds.map((id) => kvGet(`intake:${tenantId}:${id}`))
    );

    const submissions = results.filter(Boolean);
    return res.status(200).json({ submissions });
  } catch (err) {
    console.error('[tenant-submissions] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}
