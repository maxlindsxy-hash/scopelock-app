// ─── Chat Transcript (Steps 1 & 2) ───────────────────────────────────────────

export interface RoomFlags {
  kitchen: boolean;
  bathroom: boolean;
  masterBedroom: boolean;
  livingZone: boolean;
  laundry: boolean;
  study: boolean;
  outdoor: boolean;
  garage: boolean;
}

export type RoomKey = keyof RoomFlags;

export interface ChatTranscript {
  q1_spaces: string;
  roomFlags: RoomFlags;
  q2_followups: Partial<Record<RoomKey, string>>;
  q3_additional: string;
  completedAt: string | null;
}

export const initialRoomFlags: RoomFlags = {
  kitchen: false,
  bathroom: false,
  masterBedroom: false,
  livingZone: false,
  laundry: false,
  study: false,
  outdoor: false,
  garage: false,
};

export const initialChatTranscript: ChatTranscript = {
  q1_spaces: '',
  roomFlags: initialRoomFlags,
  q2_followups: {},
  q3_additional: '',
  completedAt: null,
};

// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectData {
  clientName: string;
  siteAddress: string;
  budgetRange: string;
  primaryMotivation: string[];
  architecturalStyles: string[];
  lifestyleGoals: string[];
  kitchenNotes: string;
  masterBedroomNotes: string;
  livingZoneNotes: string;
  additionalNotes: string;
}

export const BUDGET_RANGES = [
  'Under $50K',
  '$50K – $100K',
  '$100K – $250K',
  '$250K – $500K',
  '$500K+',
];

export const MOTIVATIONS = [
  'Expanding for Family',
  'Modernising / Renovating',
  'Increasing Home Value',
  'Improving Functionality',
  'Creating Dream Home',
  'Investment Property',
  'Accessibility Upgrade',
  'Other',
];

export const ARCH_STYLES = [
  'Modern Minimalist',
  'Hamptons',
  'Coastal',
  'Traditional',
  'Industrial',
  'Farmhouse',
  'Contemporary',
  'Art Deco',
  'Mid-Century Modern',
  'Scandinavian',
];

export const LIFESTYLE_GOALS = [
  'Maximising Natural Light',
  'Indoor–Outdoor Flow',
  'Open Plan Living',
  'Smart Home Integration',
  'Entertaining Spaces',
  'Low Maintenance',
  'Accessibility Features',
  'Sustainability / Eco-Friendly',
  'Dedicated Storage Solutions',
  'Home Office / Study',
];

export interface ContractorProfile {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  licenseNumber: string;
  abn: string;
  logoDataUrl: string;
}

export const initialContractorProfile: ContractorProfile = {
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  website: '',
  licenseNumber: '',
  abn: '',
  logoDataUrl: '',
};

// ─── Session ─────────────────────────────────────────────────────────────────

export type SessionStatus = 'draft' | 'generated';

export interface Session {
  id: string;
  createdAt: string;
  updatedAt: string;
  data: ProjectData;
  transcript: ChatTranscript | null;
  refNumber: string;
  generatedDate: string;
  signatureDataUrl: string;
  status: SessionStatus;
}

// ─────────────────────────────────────────────────────────────────────────────

export const initialProjectData: ProjectData = {
  clientName: '',
  siteAddress: '',
  budgetRange: '',
  primaryMotivation: [],
  architecturalStyles: [],
  lifestyleGoals: [],
  kitchenNotes: '',
  masterBedroomNotes: '',
  livingZoneNotes: '',
  additionalNotes: '',
};
