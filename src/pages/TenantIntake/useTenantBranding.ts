import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export interface TenantBranding {
  tenantId: string;
  displayName: string;
  tagline: string;
  loading: boolean;
}

function slugToName(slug: string): string {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function useTenantBranding(): TenantBranding {
  const { tenant = '' } = useParams<{ tenant: string }>();
  const [displayName, setDisplayName] = useState(() => slugToName(tenant));
  const [tagline, setTagline] = useState('Project Brief Intake');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant) { setLoading(false); return; }
    fetch(`/api/tenant-branding?slug=${encodeURIComponent(tenant)}`)
      .then((r) => r.json())
      .then((data: { displayName?: string; tagline?: string }) => {
        if (data.displayName) setDisplayName(data.displayName);
        if (data.tagline) setTagline(data.tagline);
      })
      .catch(() => { /* keep slug-derived fallback */ })
      .finally(() => setLoading(false));
  }, [tenant]);

  return { tenantId: tenant, displayName, tagline, loading };
}
