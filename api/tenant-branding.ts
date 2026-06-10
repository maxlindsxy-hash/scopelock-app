export const config = { runtime: 'edge' };

declare const process: { env: Record<string, string | undefined> };

interface BrandingProfile {
  displayName: string;
  tagline: string;
}

const REGISTRY: Record<string, BrandingProfile> = {
  'apex-builds':           { displayName: 'Apex Builds',           tagline: 'Project Brief Intake' },
  'coastal-constructions': { displayName: 'Coastal Constructions', tagline: 'Project Brief Intake' },
  'signature-homes':       { displayName: 'Signature Homes',       tagline: 'New Home Brief'        },
  'prestige-renovations':  { displayName: 'Prestige Renovations',  tagline: 'Renovation Brief'      },
};

async function kvGetBranding(slug: string): Promise<BrandingProfile | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(`${url}/get/${encodeURIComponent(`tenant:${slug}`)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json() as { result: unknown };
  const raw = json.result;
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as BrandingProfile; } catch { return null; }
  }
  return raw as BrandingProfile;
}

export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return new Response(JSON.stringify({ error: 'slug is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const entry = REGISTRY[slug];
  if (entry) {
    return new Response(JSON.stringify(entry), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const profile = await kvGetBranding(slug);
  if (profile) {
    return new Response(JSON.stringify(profile), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response(JSON.stringify({ error: 'Tenant not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
