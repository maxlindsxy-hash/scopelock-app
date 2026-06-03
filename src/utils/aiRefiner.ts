import type { ProjectData } from '../types';

export interface RefinedBriefData {
  projectNarrative: string;
  motivationStatement: string;
  designPhilosophy: string;
  lifestyleScopeItems: string[];
  kitchenScope: string;
  masterBedroomScope: string;
  livingZoneScope: string;
  additionalScope: string;
}

interface PatternExpansion {
  keywords: string[];
  expansion: string;
}

// ─── Kitchen Expansion Patterns ───────────────────────────────────────────────

const KITCHEN_EXPANSIONS: PatternExpansion[] = [
  {
    keywords: ['big kitchen', 'large kitchen', 'spacious kitchen', 'generous kitchen', 'huge kitchen'],
    expansion: 'Design and construct a premium culinary workspace of generous proportions, incorporating an extended preparation zone with ample circulation clearance to accommodate multi-person occupancy and simultaneous use across all kitchen functions.',
  },
  {
    keywords: ['island bench', 'kitchen island', 'bench island', 'island unit'],
    expansion: 'Integrate a statement kitchen island with a waterfall-edge engineered stone profile, housing a flush-mounted induction cooktop, concealed under-bench cabinetry with soft-close mechanisms, and an overhang breakfast bar configuration to facilitate casual dining and social engagement.',
  },
  {
    keywords: ["butler's pantry", "butlers pantry", 'scullery', 'walk-in pantry', 'walkin pantry'],
    expansion: "Incorporate a fully equipped butler's pantry with a dedicated secondary preparation sink, integrated appliance provisions, full-height adjustable shelving, and concealed service access to maintain a clean and uncluttered primary kitchen aesthetic during formal and everyday use.",
  },
  {
    keywords: ['open kitchen', 'open plan kitchen', 'open-plan kitchen', 'kitchen connects', 'connected kitchen'],
    expansion: 'Execute an open-plan kitchen configuration integrating seamlessly with the adjacent living and dining zones, eliminating visual and physical barriers to achieve a cohesive, socially connected domestic environment with optimised spatial perception.',
  },
  {
    keywords: ['stone benchtop', 'stone bench', 'marble bench', 'engineered stone', 'caesarstone', 'stone top', 'stone countertop'],
    expansion: 'Specify premium engineered stone or natural stone benchtop surfaces with a minimum 20mm machined profile, complemented by a coordinated full-height splashback tiling system and integrated drainage channel solutions across the primary preparation zones.',
  },
  {
    keywords: ['fully integrated', 'integrated appliance', 'high-end appliance', 'quality appliance', 'premium appliance', 'good appliance'],
    expansion: 'Specify a fully integrated premium appliance suite incorporating a multi-function pyrolytic oven, precision induction cooktop, a concealed ceiling-mounted or integrated rangehood system, integrated dishwasher, and full-height refrigeration column to ensure a seamless, high-performance culinary environment.',
  },
  {
    keywords: ['lots of storage', 'extra storage', 'more storage', 'ample storage', 'good storage', 'storage kitchen'],
    expansion: 'Implement a comprehensive integrated cabinetry strategy featuring full-height upper and lower storage configurations, internal drawer and divider systems, dedicated pantry provisions, pull-out waste infrastructure, and soft-close mechanisms throughout to maximise organisational functionality.',
  },
  {
    keywords: ['double oven', 'two ovens', '2 ovens', 'dual oven'],
    expansion: 'Specify a dual-oven configuration incorporating a primary pyrolytic oven with full convection functionality and a secondary steam or combi-microwave unit, installed at ergonomic heights within a dedicated full-height appliance tower column.',
  },
  {
    keywords: ['north-facing kitchen', 'north facing kitchen', 'kitchen light', 'bright kitchen', 'natural light kitchen'],
    expansion: 'Orient the kitchen zone to maximise northern solar exposure, supplemented by carefully positioned task and ambient illumination systems to ensure the culinary workspace is optimally lit across all hours of occupation.',
  },
  {
    keywords: ['island', 'bench'],
    expansion: 'Integrate a central kitchen island or extended benchtop configuration to enhance the preparation and serving workflow, incorporating appropriate power, data, and under-bench storage provisions.',
  },
];

// ─── Master Bedroom Expansion Patterns ───────────────────────────────────────

const BEDROOM_EXPANSIONS: PatternExpansion[] = [
  {
    keywords: ['walk-in wardrobe', 'walk-in robe', 'walkin robe', 'walk in wardrobe', 'walk in robe', 'wir', 'large wardrobe', 'big wardrobe'],
    expansion: 'Design a dedicated walk-in wardrobe suite with full-height custom joinery incorporating double-hanging and single-hanging provisions, open shelving modules, integrated shoe storage, a central island with soft-close drawers, and discreet recessed task lighting to create a premium residential dressing environment.',
  },
  {
    keywords: ['ensuite', 'en-suite', 'en suite', 'bathroom ensuite', 'private bathroom'],
    expansion: 'Construct a premium ensuite incorporating floor-to-ceiling large-format porcelain tiling, a double vanity with undermount basins and integrated storage cabinetry, a frameless semi-steam shower enclosure with ceiling-mounted rainfall head, and premium-grade tapware and fixture specification throughout.',
  },
  {
    keywords: ['large master', 'big master', 'spacious master', 'large bedroom', 'big bedroom', 'generous bedroom', 'master suite', 'generous master'],
    expansion: 'Configure the master suite with generous proportions sufficient to accommodate a king-bed configuration with bilateral bedside furniture, a reading nook or seating provision, and optimal natural daylighting through considered glazing placement and internal ceiling height specification.',
  },
  {
    keywords: ['freestanding bath', 'free standing bath', 'spa bath', 'soaking tub', 'bath tub', 'bathtub', 'freestanding tub'],
    expansion: 'Incorporate a designer freestanding soaking vessel as the primary architectural focal element of the ensuite, strategically positioned to maximise natural light exposure and spatial drama, with a floor-mounted spout fitting finished in a coordinated premium tapware specification.',
  },
  {
    keywords: ['dressing room', 'dressing suite', 'dressing area'],
    expansion: 'Integrate a fully fitted dressing room environment with bespoke full-height cabinetry, full-length mirrored panel integration, a central island bench with soft-close drawers, and layered ambient and task lighting to establish a couture-level personal wardrobe and preparation environment.',
  },
  {
    keywords: ['double vanity', 'two sinks', '2 sinks', 'his and hers', 'dual vanity'],
    expansion: 'Specify a premium double vanity configuration with individually allocated undermount basins, integrated storage cabinetry below, and a continuous backlit mirror or dual recessed mirror cabinets above to accommodate simultaneous occupancy without compromise.',
  },
  {
    keywords: ['north-facing', 'north facing', 'bedroom light', 'natural light bedroom', 'bedroom aspect'],
    expansion: 'Orient the master suite to a northern or north-eastern aspect, ensuring premium solar access and passive thermal warmth in winter months while specifying operable external screening or high-performance glazing to manage summer solar gain and privacy requirements.',
  },
  {
    keywords: ['5m', '4m', '6m', 'minimum size', 'target size', 'bedroom size'],
    expansion: 'Establish minimum internal floor area targets for the master suite in accordance with the client\'s spatial brief, ensuring the final configuration supports furniture arrangement, adequate circulation, and compliance with applicable building code clearance requirements.',
  },
];

// ─── Living Zone Expansion Patterns ──────────────────────────────────────────

const LIVING_EXPANSIONS: PatternExpansion[] = [
  {
    keywords: ['big windows', 'large windows', 'lots of windows', 'windows for light', 'floor to ceiling windows', 'floor-to-ceiling windows', 'expansive glazing', 'window wall', 'huge windows'],
    expansion: 'Optimise the building envelope by implementing high-performance expansive glazing profiles — including full-height aluminium-framed window systems and stacker or bifold door assemblies — to maximise passive solar gain, ambient daylighting, and visual connectivity to the external landscape setting throughout all principal zones.',
  },
  {
    keywords: ['natural light', 'light-filled', 'light filled', 'bright living', 'lots of light', 'more light', 'daylighting'],
    expansion: 'Engineer a luminous interior environment through strategic north-facing orientation, clerestory window integration, and reflective internal surface finishes that collectively maximise diffuse daylighting penetration across all primary occupied zones at all times of day.',
  },
  {
    keywords: ['indoor outdoor', 'indoor-outdoor', 'outdoor living', 'outdoor entertaining', 'alfresco', 'bi-fold', 'bifold', 'stacker door', 'stacker doors', 'connect to garden', 'outdoor connection', 'outdoor room'],
    expansion: 'Establish seamless indoor-outdoor spatial continuity through the integration of large-format thermally broken bifold or stacker door systems, dissolving the threshold between internal living zones and the external alfresco entertaining and landscape environment with a continuous material and level transition.',
  },
  {
    keywords: ['open plan', 'open living', 'open layout', 'open-plan', 'combined kitchen dining', 'kitchen dining living', 'kitchen living dining'],
    expansion: 'Execute a fully resolved open-plan spatial configuration dissolving conventional cellular room boundaries to deliver a cohesive, socially integrated living, dining, and kitchen environment that maximises spatial perception, natural cross-ventilation, and familial connectivity across the primary domestic zones.',
  },
  {
    keywords: ['fireplace', 'gas fire', 'open fire', 'wood fire', 'feature fireplace', 'gas fireplace'],
    expansion: 'Integrate a statement fireplace — specified in a gas-flued linear or wood-burning solid fuel format — as the primary thermal comfort element and architectural focal point of the principal living zone, framed by bespoke built-in joinery with considered hearth and surround detailing.',
  },
  {
    keywords: ['high ceiling', 'tall ceiling', 'raked ceiling', 'vaulted ceiling', 'cathedral ceiling', 'double height', 'high ceilings'],
    expansion: 'Specify elevated ceiling heights with a minimum 2700mm configuration, incorporating raked, vaulted, or cathedral forms and cofferred or bulkhead detailing as appropriate to impart a sense of spatial grandeur, enhanced volumetric quality, and architectural character throughout the principal zones.',
  },
  {
    keywords: ['media room', 'home theatre', 'theatre room', 'cinema room', 'entertainment room', 'screening room'],
    expansion: 'Designate a dedicated home cinema and media environment with acoustic wall and ceiling treatment, tiered seating provisions, 4K projection or premium large-format display integration, and fully concealed AV equipment housing designed to deliver an immersive residential screening experience.',
  },
  {
    keywords: ['separate lounge', 'formal lounge', 'formal living', 'second living area', 'second living', 'sitting room', 'retreat'],
    expansion: 'Provision a secondary formal living or sitting room spatially separated from the open-plan casual zone, providing a quiet, refined retreat environment suitable for formal entertaining, quiet occupation, or multi-generational household use.',
  },
  {
    keywords: ['north-facing living', 'north facing living', 'north aspect', 'northern aspect', 'orientate north'],
    expansion: 'Orient principal living zones to the north to maximise passive solar access during winter months, with appropriate roof overhangs, eave projections, and high-performance glazing calculated to control summer solar penetration and minimise reliance on mechanical cooling systems.',
  },
];

// ─── Additional Notes Expansion Patterns ─────────────────────────────────────

const ADDITIONAL_EXPANSIONS: PatternExpansion[] = [
  {
    keywords: ['solar panel', 'solar power', 'photovoltaic', 'pv system', 'solar energy', 'solar array', 'solar system'],
    expansion: 'Integrate a roof-mounted photovoltaic array system appropriately sized to offset primary residential energy consumption, complemented by a lithium-ion battery storage system and smart energy management interface for real-time generation, consumption, and export performance monitoring.',
  },
  {
    keywords: ['smart home', 'home automation', 'automation system', 'automated lighting', 'automated home', 'building automation', 'home control'],
    expansion: 'Deploy a comprehensive building automation and smart home ecosystem encompassing integrated dimming lighting control, zoned hydronic or refrigerant climate management, multi-layered security and access control systems, whole-of-home AV distribution, and a centralised digital interface for intuitive whole-of-home management.',
  },
  {
    keywords: ['swimming pool', 'inground pool', 'in-ground pool', 'pool area', 'plunge pool', 'lap pool'],
    expansion: 'Construct a premium in-ground concrete aquatic facility with a selected tiled or pebblecrete interior finish, integrated automatic pool blanket and gas or heat pump heating system, automated filtration and chemical management infrastructure, and a coordinated landscape and hardscape surround to create a resort-calibre residential amenity.',
  },
  {
    keywords: ['home gym', 'gym room', 'fitness room', 'exercise room', 'workout room', 'fitness studio'],
    expansion: 'Designate a purpose-built fitness and wellness studio with reinforced concrete or rubber-topped flooring, full-height mirrored wall panels, dedicated mechanical ventilation provisions, acoustic separation treatment, and utility infrastructure to support a fully equipped personal training environment.',
  },
  {
    keywords: ['landscaping', 'garden design', 'outdoor garden', 'landscape design', 'gardens', 'landscape'],
    expansion: 'Commission a comprehensive landscape architecture scheme addressing site grading and stormwater drainage, automated irrigation infrastructure, specimen planting design, coordinated hardscape paving and stepping, boundary treatment and screening, and integrated external lighting to create a cohesive, sustainable, and maintainable residential landscape setting.',
  },
  {
    keywords: ['double garage', 'large garage', 'oversized garage', 'triple garage', '3 car garage', 'big garage'],
    expansion: 'Design and construct an oversized double or triple garage with a minimum 6600mm internal width configuration, epoxy resin floor coating, mezzanine storage provisions, dedicated 32-amp EV charging infrastructure, and a direct internal access point to the primary residence via a transitional mudroom or entry lobby.',
  },
  {
    keywords: ['energy efficient', 'eco-friendly', 'eco friendly', 'sustainable design', 'green home', 'passive solar', 'passive design', 'sustainability', 'environmentally'],
    expansion: 'Implement a holistic passive design strategy incorporating high-performance insulated wall and roof assemblies, double-glazed thermally broken window systems, cross-ventilation planning, thermal mass integration within the building fabric, and energy-efficient mechanical services to meet or exceed the minimum NCC 2022 Section J energy performance benchmarks.',
  },
  {
    keywords: ['deck', 'decking', 'timber deck', 'composite deck', 'outdoor deck', 'hardwood deck'],
    expansion: 'Construct a premium hardwood or engineered composite decking platform with a structural bearer and joist subframe, integrated powder-coated aluminium or hardwood balustrade system, and concealed recessed LED strip lighting to create a refined and durable extension of the principal indoor living zones into the landscape environment.',
  },
  {
    keywords: ['home office', 'study room', 'dedicated office', 'work from home', 'study nook', 'home study'],
    expansion: 'Designate a dedicated home office and study environment with appropriate acoustic separation, integrated bespoke joinery incorporating a continuous work surface, overhead shelving, and concealed filing provisions, structured cabling and power infrastructure, and natural daylighting sufficient to support sustained professional occupation.',
  },
  {
    keywords: ['heritage overlay', 'heritage listed', 'heritage area', 'conservation overlay'],
    expansion: 'All proposed works are to be designed and documented in full compliance with the applicable Heritage Overlay controls and permit conditions, ensuring that all additions and alterations are contextually sympathetic to the significance of the existing built fabric and consistent with relevant local council heritage guidelines.',
  },
  {
    keywords: ['polished concrete', 'concrete floor', 'concrete floors', 'concrete slab finish'],
    expansion: 'Specify a premium grinding and polished concrete floor finish to all applicable ground-level surfaces, incorporating a minimum 800-grit polished profile with a penetrating sealer application to deliver a durable, low-maintenance, and visually seamless surface treatment across internal and transition zones.',
  },
  {
    keywords: ['retain tree', 'existing tree', 'keep tree', 'tree protection', 'significant tree', 'old tree'],
    expansion: 'Implement a site-specific Tree Protection Zone management plan in accordance with AS 4970-2009, ensuring all construction activities, excavation works, and services infrastructure are designed and sequenced to preserve the structural integrity, root zone, and ongoing health of the identified significant existing vegetation.',
  },
  {
    keywords: ['future pool', 'provision for pool', 'pool provision', 'pool later'],
    expansion: 'Incorporate structural design provisions and conduit infrastructure within the ground-level slab and substructure to accommodate a future in-ground aquatic facility, including appropriate geotechnical investigation allowances, retaining wall design coordination, and services routing consistent with the anticipated future pool installation program.',
  },
  {
    keywords: ['carport', 'car port', 'covered parking'],
    expansion: 'Design and construct a covered parking structure with robust steel or timber post-and-beam framing, coordinated roofing material consistent with the primary dwelling, and appropriate drainage and lighting infrastructure to deliver a protected vehicle storage solution.',
  },
  {
    keywords: ['garage', 'car garage', 'single garage'],
    expansion: 'Design and construct a single or double garage with internal dimensions compliant with applicable planning requirements, finished concrete or epoxy flooring, automated panel lift door systems, and direct internal access connection to the primary residence.',
  },
];

// ─── Chip Mapping Dictionaries ────────────────────────────────────────────────

const STYLE_DESCRIPTIONS: Record<string, string> = {
  'Modern Minimalist': 'A rigorous minimalist design philosophy emphasising clean geometric form, restrained material palettes, and the deliberate elimination of superfluous ornamentation to achieve spatial purity and visual clarity across all zones.',
  'Hamptons': 'A refined Hamptons aesthetic drawing upon classic American coastal residential architecture — characterised by symmetrical facades, painted timber cladding, pitched shingle rooflines, and a light-filled, elegant interior palette of whites, navies, and natural timbers.',
  'Coastal': 'A relaxed coastal architectural sensibility expressing natural materiality, elevated deck configurations, broad roof overhangs for solar protection, and a considered palette directly referencing sand, sea, and sky in both material and colour selection.',
  'Traditional': 'A classical residential architectural character featuring formal compositional symmetry, heritage material specification, and considered ornamentation applied consistently with enduring domestic building tradition and contemporary craft standards.',
  'Industrial': 'An industrial design vocabulary leveraging exposed structural elements — expressed steel sections, raw board-formed concrete, reclaimed timber, and black metalwork detailing — to create an authentic, textured, and spatially dynamic interior environment.',
  'Farmhouse': 'A contemporary farmhouse aesthetic balancing vernacular agricultural character with modern spatial planning — expressed through board-and-batten cladding, wrap-around verandah provisions, corrugated metal roofing accents, and warm, honest natural interior finish selections.',
  'Contemporary': 'A contemporary residential design approach informed by current international architectural discourse, emphasising dynamic spatial planning, innovative material application, and a refined, resolved aesthetic character that responds authentically to site and context.',
  'Art Deco': 'An Art Deco-inspired design sensibility employing bold geometric ornamentation, stepped profile detailing, terrazzo and polished stone surface specifications, and rich decorative patterning characteristic of the interwar modernist period.',
  'Mid-Century Modern': 'A mid-century modern design ethos characterised by clean horizontal lines, the deliberate integration of the landscape through expansive glazing, expressed structural systems, and a curated palette of natural timbers, stone, and manufactured materials.',
  'Scandinavian': 'A Scandinavian-influenced minimalist aesthetic prioritising functional spatial planning, honest structural material expression, biophilic landscape connection, and a restrained monochromatic palette enriched by natural timber grain and warm textile accents.',
};

const MOTIVATION_DESCRIPTIONS: Record<string, string> = {
  'Expanding for Family': 'to expand the residential floor area and functional capacity of the property to accommodate the evolving spatial and lifestyle needs of a growing family unit',
  'Modernising / Renovating': 'to comprehensively modernise and renovate the existing built fabric, upgrading spatial quality, material finishes, and building performance characteristics to current contemporary residential standards',
  'Increasing Home Value': 'to strategically enhance the capital value and market appeal of the property through targeted, high-quality design and construction improvements aligned with the prevailing residential market',
  'Improving Functionality': 'to improve the functional performance and liveability of the residential environment through considered spatial reconfiguration, services upgrading, and purposeful interior planning',
  'Creating Dream Home': "to realise a bespoke residential environment precisely tailored to the client's lifestyle requirements, aesthetic aspirations, and long-term habitability needs",
  'Investment Property': 'to develop or improve the property as a residential investment vehicle to optimise rental yield potential, capital appreciation, and long-term asset performance',
  'Accessibility Upgrade': "to comprehensively upgrade the property's accessibility provisions to support the current and future mobility and independent living requirements of the occupants",
  'Other': "to undertake a residential construction or renovation project as defined by the client's specific brief and agreed program of requirements",
};

const LIFESTYLE_SCOPE: Record<string, string> = {
  'Maximising Natural Light': 'Incorporate strategic daylighting design through north-facing orientation, clerestory window integration, and light-reflective interior surface specifications to maximise ambient luminance across all primary zones.',
  'Indoor–Outdoor Flow': 'Achieve seamless indoor-outdoor spatial integration through large-format bifold or stacker door systems and coordinated internal-external material and level continuity.',
  'Open Plan Living': 'Execute a fully open-plan living, dining, and kitchen configuration to maximise spatial coherence, natural cross-ventilation, and social connectivity throughout the ground-floor living environment.',
  'Smart Home Integration': 'Integrate a comprehensive building automation system encompassing programmable lighting control, zoned climate management, security and access infrastructure, and AV distribution throughout the residence.',
  'Entertaining Spaces': 'Design premium internal and external entertaining environments capable of supporting both intimate and large-scale social functions, with appropriate catering, seating, and service provisions.',
  'Low Maintenance': 'Specify durable, low-maintenance external cladding, hard landscaping, and interior finish selections to minimise ongoing property upkeep requirements and lifecycle ownership costs.',
  'Accessibility Features': 'Incorporate universal design principles including step-free access paths, wider doorway clearances, reinforced wet-area walls, and adaptable bathroom provisions consistent with AS 1428 guidelines.',
  'Sustainability / Eco-Friendly': 'Implement a passive design strategy incorporating high-performance insulation, double-glazed thermally broken windows, photovoltaic provisions, and rainwater harvesting infrastructure to reduce the environmental footprint of the dwelling.',
  'Dedicated Storage Solutions': 'Integrate purpose-designed storage solutions across all zones, including full-height built-in cabinetry, linen press provisions, external utility storage structures, and concealed service and utility areas.',
  'Home Office / Study': 'Designate a dedicated, acoustically separated home office environment with integrated bespoke joinery, structured data cabling infrastructure, and natural daylighting appropriate to support sustained professional occupation.',
};

// ─── Expansion Engine ─────────────────────────────────────────────────────────

function expandWithPatterns(text: string, patterns: PatternExpansion[]): string {
  if (!text.trim()) return '';

  const normalized = text.toLowerCase();
  const matched: string[] = [];
  const usedExpansions = new Set<string>();

  for (const pattern of patterns) {
    if (pattern.keywords.some((kw) => normalized.includes(kw.toLowerCase()))) {
      if (!usedExpansions.has(pattern.expansion)) {
        matched.push(pattern.expansion);
        usedExpansions.add(pattern.expansion);
      }
    }
  }

  if (matched.length > 0) {
    return matched.join(' ');
  }

  return text.trim();
}

// ─── Main Refiner ─────────────────────────────────────────────────────────────

export function refineProjectBrief(data: ProjectData): RefinedBriefData {
  const motivationPhrases = data.primaryMotivation
    .map((m) => MOTIVATION_DESCRIPTIONS[m] ?? m.toLowerCase())
    .filter(Boolean);

  const motivationStatement =
    motivationPhrases.length > 0
      ? `The client seeks ${motivationPhrases.join('; and ')}. The scope of works shall be delivered in accordance with the attached program of requirements and agreed project parameters.`
      : '';

  const clientRef = data.clientName || 'The client';
  const siteRef = data.siteAddress ? ` at ${data.siteAddress}` : '';
  const budgetRef = data.budgetRange ? ` within a defined investment envelope of ${data.budgetRange}` : '';
  const motivRef =
    motivationPhrases.length > 0
      ? ` The primary project driver is ${motivationPhrases[0]}.`
      : '';

  const projectNarrative = `${clientRef} has engaged the project team to undertake a residential design and construction program${siteRef}${budgetRef}.${motivRef} This preliminary project brief establishes the agreed scope of works, design intent parameters, and key spatial requirements to serve as the controlling document for all subsequent design development and construction activities.`;

  const philosophyItems = data.architecturalStyles
    .map((s) => STYLE_DESCRIPTIONS[s])
    .filter(Boolean);

  const designPhilosophy =
    philosophyItems.length > 0
      ? philosophyItems.join(' The design further incorporates elements of: ')
      : '';

  const lifestyleScopeItems = data.lifestyleGoals
    .map((g) => LIFESTYLE_SCOPE[g])
    .filter((s): s is string => !!s);

  return {
    projectNarrative,
    motivationStatement,
    designPhilosophy,
    lifestyleScopeItems,
    kitchenScope: expandWithPatterns(data.kitchenNotes, KITCHEN_EXPANSIONS),
    masterBedroomScope: expandWithPatterns(data.masterBedroomNotes, BEDROOM_EXPANSIONS),
    livingZoneScope: expandWithPatterns(data.livingZoneNotes, LIVING_EXPANSIONS),
    additionalScope: expandWithPatterns(data.additionalNotes, ADDITIONAL_EXPANSIONS),
  };
}
