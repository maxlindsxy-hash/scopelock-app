import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ProjectData, ContractorProfile } from '../types';
import type { RefinedBriefData } from '../utils/aiRefiner';

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  indigo: '#4f46e5',
  indigoLight: '#eef2ff',
  indigoBorder: '#c7d2fe',
  indigoText: '#3730a3',
  dark: '#1c1b1a',
  body: '#5a5755',
  muted: '#5a5755',
  faint: '#9b9895',
  placeholder: '#c5c2bf',
  border: '#e8e6e3',
  bgLight: '#f7f6f4',
  white: '#ffffff',
  bullet: '#818cf8',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.body,
    paddingTop: 44,
    paddingHorizontal: 44,
    paddingBottom: 44,
    backgroundColor: C.white,
    lineHeight: 1.4,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: C.border,
  },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  contractorLogo: { width: 42, height: 42, borderRadius: 4, marginRight: 10 },
  contractorInfo: { flex: 1 },
  companyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: C.dark,
    marginBottom: 3,
  },
  contractorMeta: { fontSize: 8, color: C.muted, marginBottom: 1.5 },
  headerRight: { alignItems: 'flex-end' },
  brandName: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.dark, marginBottom: 2 },
  docTitle: { fontSize: 8.5, color: C.muted, marginBottom: 2 },
  refBadge: { fontSize: 7.5, color: C.faint },

  // ── Section divider ─────────────────────────────────────────────────────
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
  dividerLine: { flex: 1, height: 0.75, backgroundColor: C.border },
  dividerLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.5,
    color: C.faint,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    marginHorizontal: 5,
  },

  // ── Field rows ───────────────────────────────────────────────────────────
  section: { marginBottom: 14 },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5 },
  fieldLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: C.faint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    width: 88,
    paddingTop: 1,
  },
  fieldValue: { fontSize: 9.5, color: C.dark, flex: 1, lineHeight: 1.5 },
  fieldEmpty: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 9,
    color: C.placeholder,
    flex: 1,
  },

  // ── Budget chip ──────────────────────────────────────────────────────────
  budgetChip: {
    backgroundColor: C.indigoLight,
    borderWidth: 1,
    borderColor: C.indigoBorder,
    borderRadius: 5,
    paddingVertical: 2.5,
    paddingHorizontal: 7,
    alignSelf: 'flex-start',
  },
  budgetText: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.indigo },

  // ── Tag chips ────────────────────────────────────────────────────────────
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: {
    backgroundColor: C.bgLight,
    borderWidth: 0.75,
    borderColor: C.border,
    borderRadius: 4,
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: { fontSize: 8, color: C.body },

  // ── Project narrative block ──────────────────────────────────────────────
  narrativeBlock: {
    backgroundColor: C.indigoLight,
    borderWidth: 1,
    borderColor: C.indigoBorder,
    borderRadius: 6,
    padding: 11,
    marginBottom: 14,
  },
  narrativeText: {
    fontSize: 9,
    color: C.indigoText,
    lineHeight: 1.65,
  },

  // ── Refined body copy ────────────────────────────────────────────────────
  refinedText: {
    fontSize: 9.5,
    color: C.body,
    lineHeight: 1.65,
    marginTop: 5,
  },
  italicMuted: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 8.5,
    color: C.muted,
    lineHeight: 1.6,
    marginTop: 5,
  },

  // ── Bullet scope list ────────────────────────────────────────────────────
  bulletList: { marginTop: 5 },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.bullet,
    marginTop: 4,
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    color: C.muted,
    lineHeight: 1.55,
  },

  // ── Room blocks ──────────────────────────────────────────────────────────
  roomBlock: { marginBottom: 10 },
  roomLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: C.faint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  roomText: { fontSize: 9.5, color: C.body, lineHeight: 1.6 },
  roomTextEmpty: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 9,
    color: C.placeholder,
    lineHeight: 1.6,
  },

  // ── Additional notes ─────────────────────────────────────────────────────
  notesText: { fontSize: 9.5, color: C.body, lineHeight: 1.7 },
  notesEmpty: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 9,
    color: C.placeholder,
    lineHeight: 1.7,
  },

  // ── Signature ────────────────────────────────────────────────────────────
  sigSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  sigTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.5,
    color: C.faint,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    textAlign: 'center',
    marginBottom: 7,
  },
  sigStatement: {
    fontSize: 8,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: 14,
  },
  sigRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sigBox: { flex: 1, alignItems: 'center', marginHorizontal: 6 },
  sigImage: { width: 140, height: 56, marginBottom: 4 },
  sigBlank: { width: '100%', height: 56, marginBottom: 4 },
  sigLine: { height: 0.75, backgroundColor: C.border, width: '100%' },
  sigLineLabel: {
    fontSize: 7,
    color: C.faint,
    marginTop: 3,
    textAlign: 'center',
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 0.75,
    borderTopColor: C.border,
  },
  footerText: {
    fontSize: 7.5,
    color: C.faint,
    textAlign: 'center',
    lineHeight: 1.7,
  },
});

// ─── Helper sub-components ───────────────────────────────────────────────────

function Divider({ title }: { title: string }) {
  return (
    <View style={styles.sectionDivider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>{title}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function TagRow({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.tagsWrap}>
      {items.map((item) => (
        <View key={item} style={styles.tag}>
          <Text style={styles.tagText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface BriefPDFProps {
  data: ProjectData;
  contractor: ContractorProfile;
  signatureDataUrl: string;
  refNumber: string;
  generatedDate: string;
  refinedData?: RefinedBriefData | null;
}

// ─── Document ────────────────────────────────────────────────────────────────

export function BriefPDF({
  data,
  contractor,
  signatureDataUrl,
  refNumber,
  generatedDate,
  refinedData,
}: BriefPDFProps) {
  return (
    <Document
      title={`ScopeLock Brief – ${data.clientName || 'Project'}`}
      author={contractor.companyName || 'ScopeLock'}
      creator="ScopeLock"
    >
      <Page size="A4" style={styles.page}>

        {/* ── Header: contractor left, ScopeLock right ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {contractor.logoDataUrl ? (
              <Image src={contractor.logoDataUrl} style={styles.contractorLogo} />
            ) : null}
            <View style={styles.contractorInfo}>
              <Text style={styles.companyName}>
                {contractor.companyName || '[Contractor Name]'}
              </Text>
              {contractor.contactName ? (
                <Text style={styles.contractorMeta}>Contact: {contractor.contactName}</Text>
              ) : null}
              {contractor.phone ? (
                <Text style={styles.contractorMeta}>P: {contractor.phone}</Text>
              ) : null}
              {contractor.email ? (
                <Text style={styles.contractorMeta}>E: {contractor.email}</Text>
              ) : null}
              {contractor.website ? (
                <Text style={styles.contractorMeta}>{contractor.website}</Text>
              ) : null}
              {(contractor.licenseNumber || contractor.abn) ? (
                <Text style={styles.contractorMeta}>
                  {[
                    contractor.licenseNumber && `Lic: ${contractor.licenseNumber}`,
                    contractor.abn && `ABN: ${contractor.abn}`,
                  ]
                    .filter(Boolean)
                    .join('  ·  ')}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.brandName}>ScopeLock</Text>
            <Text style={styles.docTitle}>Project Brief &amp; Preliminary Scope</Text>
            <Text style={styles.refBadge}>
              {refNumber}  ·  {generatedDate}
              {refinedData ? '  ·  AI Enhanced' : ''}
            </Text>
          </View>
        </View>

        {/* ── Project Narrative (AI only) ── */}
        {refinedData?.projectNarrative ? (
          <View style={styles.narrativeBlock}>
            <Text style={styles.narrativeText}>{refinedData.projectNarrative}</Text>
          </View>
        ) : null}

        {/* ── 1. Client & Site ── */}
        <View style={styles.section}>
          <Divider title="Client &amp; Project Details" />
          <FieldRow label="Client" value={data.clientName} />
          <FieldRow label="Site Address" value={data.siteAddress} />
        </View>

        {/* ── 2. Project Overview ── */}
        <View style={styles.section}>
          <Divider title="Project Overview" />
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Budget Range</Text>
            {data.budgetRange ? (
              <View style={styles.budgetChip}>
                <Text style={styles.budgetText}>{data.budgetRange}</Text>
              </View>
            ) : (
              <Text style={styles.fieldEmpty}>Not specified</Text>
            )}
          </View>
          <View style={{ marginTop: 5 }}>
            <Text style={{ ...styles.fieldLabel, marginBottom: 5 }}>Motivations</Text>
            <TagRow items={data.primaryMotivation} />
            {refinedData?.motivationStatement ? (
              <Text style={styles.italicMuted}>{refinedData.motivationStatement}</Text>
            ) : null}
          </View>
        </View>

        {/* ── 3. Design Vision ── */}
        <View style={styles.section}>
          <Divider title="Design Vision" />
          <View style={{ marginBottom: 9 }}>
            <Text style={{ ...styles.fieldLabel, marginBottom: 5 }}>Architectural Style</Text>
            <TagRow items={data.architecturalStyles} />
            {refinedData?.designPhilosophy ? (
              <Text style={styles.refinedText}>{refinedData.designPhilosophy}</Text>
            ) : null}
          </View>
          <View>
            <Text style={{ ...styles.fieldLabel, marginBottom: 5 }}>Lifestyle Goals</Text>
            <TagRow items={data.lifestyleGoals} />
            {refinedData && refinedData.lifestyleScopeItems.length > 0 ? (
              <View style={styles.bulletList}>
                {refinedData.lifestyleScopeItems.map((item, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        {/* ── 4. Room Specifications ── */}
        <View style={styles.section}>
          <Divider title="Room Specifications" />
          {(
            [
              ['Kitchen', data.kitchenNotes, refinedData?.kitchenScope],
              ['Master Bedroom Suite', data.masterBedroomNotes, refinedData?.masterBedroomScope],
              ['Living Zones', data.livingZoneNotes, refinedData?.livingZoneScope],
            ] as [string, string, string | undefined][]
          )
            .filter(([_label, raw, refined]) => !!(refined || raw))
            .map(([label, raw, refined]) => {
              const display = refined && refined !== raw ? refined : raw;
              return (
                <View key={label} style={styles.roomBlock}>
                  <Text style={styles.roomLabel}>{label}</Text>
                  <Text style={styles.roomText}>{display}</Text>
                </View>
              );
            })}
        </View>

        {/* ── 5. Additional Requirements ── */}
        {(refinedData?.additionalScope || data.additionalNotes) ? (
          <View style={styles.section}>
            <Divider title="Additional Requirements" />
            <Text style={styles.notesText}>
              {refinedData?.additionalScope && refinedData.additionalScope !== data.additionalNotes
                ? refinedData.additionalScope
                : data.additionalNotes}
            </Text>
          </View>
        ) : null}

        {/* ── 6. Dual Signature Block ── */}
        <View style={styles.sigSection}>
          <Text style={styles.sigTitle}>Signatures &amp; Acknowledgement</Text>
          <Text style={styles.sigStatement}>
            I/We confirm that the information captured in this project brief accurately
            reflects our requirements and preferences as discussed with the contractor.
          </Text>

          <View style={styles.sigRow}>
            {/* LEFT — Contractor Authorisation */}
            <View style={[styles.sigBox, { marginRight: 12 }]}>
              <View style={styles.sigBlank} />
              <View style={styles.sigLine} />
              <Text style={styles.sigLineLabel}>Contractor Authorisation</Text>
              {contractor.companyName ? (
                <Text style={{ fontSize: 7.5, color: C.muted, marginTop: 2, textAlign: 'center' }}>
                  {contractor.companyName}
                </Text>
              ) : null}
            </View>

            {/* RIGHT — Client Acknowledgement */}
            <View style={[styles.sigBox, { marginLeft: 12 }]}>
              {signatureDataUrl ? (
                <Image src={signatureDataUrl} style={styles.sigImage} />
              ) : (
                <View style={styles.sigBlank} />
              )}
              <View style={styles.sigLine} />
              <Text style={styles.sigLineLabel}>Client Acknowledgement</Text>
              {data.clientName ? (
                <Text style={{ fontSize: 7.5, color: C.muted, marginTop: 2, textAlign: 'center' }}>
                  {data.clientName}
                </Text>
              ) : null}
              {generatedDate ? (
                <Text style={{ fontSize: 7, color: C.faint, marginTop: 1, textAlign: 'center' }}>
                  {generatedDate}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {[
              `Generated by ScopeLock`,
              generatedDate,
              refNumber,
              contractor.companyName,
            ]
              .filter(Boolean)
              .join('  ·  ')}
            {'\n'}
            This document is a preliminary brief and is subject to design development
            and formal quotation.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
