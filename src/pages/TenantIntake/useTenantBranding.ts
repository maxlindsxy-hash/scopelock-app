import { useParams } from 'react-router-dom';

export interface TenantBranding {
  tenantId: string;
  displayName: string;
  tagline: string;
}

// Mock registry — replace with a DB/Edge Config lookup once contractor auth exists
const MOCK_REGISTRY: Record<string, Pick<TenantBranding, 'displayName' | 'tagline'>> = {
  'apex-builds':           { displayName: 'Apex Builds',           tagline: 'Project Brief Intake' },
  'coastal-constructions': { displayName: 'Coastal Constructions', tagline: 'Project Brief Intake' },
  'signature-homes':       { displayName: 'Signature Homes',       tagline: 'New Home Brief'        },
  'prestige-renovations':  { displayName: 'Prestige Renovations',  tagline: 'Renovation Brief'      },
};

function slugToName(slug: string): string {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function useTenantBranding(): TenantBranding {
  const { tenant = '' } = useParams<{ tenant: string }>();
  const entry = MOCK_REGISTRY[tenant];
  return {
    tenantId: tenant,
    displayName: entry?.displayName ?? slugToName(tenant),
    tagline:     entry?.tagline     ?? 'Project Brief Intake',
  };
}
