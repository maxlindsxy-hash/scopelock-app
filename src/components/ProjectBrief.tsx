import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Lock, Calendar, Hash, User, MapPin, Download, Loader2, Building2, Sparkles, CheckCircle2 } from 'lucide-react';
import type { ProjectData, ContractorProfile } from '../types';
import type { RefinedBriefData } from '../utils/aiRefiner';
import { SignatureField } from './SignatureField';

interface Props {
  data: ProjectData;
  contractor: ContractorProfile;
  generated: boolean;
  refNumber: string;
  generatedDate: string;
  signatureDataUrl: string;
  onSignatureChange: (dataUrl: string) => void;
  onDownloadPDF: () => void;
  isGeneratingPDF: boolean;
  isRefining?: boolean;
  refinedData?: RefinedBriefData | null;
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-100" />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 px-1">
          {title}
        </h3>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
      {children}
    </div>
  );
}

function TagList({ items, placeholder }: { items: string[]; placeholder: string }) {
  if (items.length === 0) return <p className="text-sm text-slate-300 italic">{placeholder}</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
          {item}
        </span>
      ))}
    </div>
  );
}

function RoomBlock({ label, value, refined }: { label: string; value: string; refined?: string }) {
  const display = refined || value;
  const isRefined = !!(refined && refined !== value);
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        {isRefined && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[9px] font-bold uppercase tracking-wide text-indigo-500">
            <Sparkles size={8} />
            AI
          </span>
        )}
      </div>
      <p className={`text-sm leading-relaxed ${display ? 'text-slate-700' : 'text-slate-300 italic'}`}>
        {display || 'No notes entered'}
      </p>
    </div>
  );
}

function AiLoadingState() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-12"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-[3px] border-indigo-100 border-t-indigo-500"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles size={18} className="text-indigo-400" />
        </div>
      </div>

      <div className="text-center space-y-1.5 max-w-[220px]">
        <p className="font-bold text-slate-800 text-sm">Analyzing with AI...</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Elevating your brief to professional architectural standards
        </p>
      </div>

      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-300"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="w-full max-w-[200px] space-y-2.5 mt-2">
        {['Parsing design selections', 'Expanding scope notes', 'Structuring brief copy'].map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.35, duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.35, type: 'spring', stiffness: 400 }}
            >
              <CheckCircle2 size={13} className="text-indigo-400 shrink-0" />
            </motion.div>
            <span className="text-xs text-slate-400">{step}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function ProjectBrief({
  data,
  contractor,
  generated,
  refNumber,
  generatedDate,
  signatureDataUrl,
  onSignatureChange,
  onDownloadPDF,
  isGeneratingPDF,
  isRefining = false,
  refinedData = null,
}: Props) {
  const hasAnyContent =
    data.clientName || data.siteAddress || data.budgetRange ||
    data.primaryMotivation.length > 0 || data.architecturalStyles.length > 0;

  const hasContractor = !!(contractor.companyName || contractor.contactName);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ── Panel toolbar ── */}
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100
                       px-5 py-3 flex items-center justify-between z-10 no-print shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-colors ${
            isRefining ? 'bg-indigo-400 animate-pulse' : generated ? 'bg-emerald-500' : 'bg-amber-400'
          }`} />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {isRefining ? 'AI Processing' : generated ? 'Brief Generated' : 'Live Preview'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            disabled={!generated || isRefining}
            title="Print"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                        transition-all ${generated && !isRefining
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                        }`}
          >
            <Printer size={12} />
            Print
          </button>
          <button
            onClick={onDownloadPDF}
            disabled={!generated || isGeneratingPDF || isRefining}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                        transition-all ${generated && !isGeneratingPDF && !isRefining
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
          >
            {isGeneratingPDF
              ? <Loader2 size={12} className="animate-spin" />
              : <Download size={12} />
            }
            {isGeneratingPDF ? 'Building…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ── Document ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6" id="brief-document">
        <AnimatePresence mode="wait">
          {isRefining ? (
            <AiLoadingState key="refining" />
          ) : !hasAnyContent && !generated ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                <Lock size={24} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 max-w-[200px] leading-relaxed">
                Your brief builds here as you fill the form
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={String(generated)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="max-w-prose mx-auto space-y-6"
            >

              {/* Contractor branding block */}
              {hasContractor && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
                  {contractor.logoDataUrl ? (
                    <img
                      src={contractor.logoDataUrl}
                      alt="Company logo"
                      className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                      <Building2 size={16} className="text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-800">{contractor.companyName}</p>
                    {contractor.contactName && (
                      <p className="text-xs text-slate-500 mt-0.5">{contractor.contactName}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      {contractor.phone && <span className="text-xs text-slate-400">{contractor.phone}</span>}
                      {contractor.email && <span className="text-xs text-slate-400">{contractor.email}</span>}
                      {contractor.licenseNumber && (
                        <span className="text-xs text-slate-400">Lic: {contractor.licenseNumber}</span>
                      )}
                      {contractor.abn && (
                        <span className="text-xs text-slate-400">ABN: {contractor.abn}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Letterhead */}
              <div className="text-center space-y-1 pb-5 border-b-2 border-slate-100">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Lock size={13} className="text-white" />
                  </div>
                  <span className="font-bold text-slate-900 text-lg tracking-tight">ScopeLock</span>
                </div>
                <h1 className="text-base font-bold text-slate-800">
                  Project Brief &amp; Preliminary Scope
                </h1>
                {generated ? (
                  <div className="flex items-center justify-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1"><Calendar size={11} />{generatedDate}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Hash size={11} />{refNumber}</span>
                    {refinedData && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-indigo-400 font-medium">
                          <Sparkles size={10} />AI Enhanced
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-amber-500 font-medium mt-1">
                    Preview — generate to finalise
                  </p>
                )}
              </div>

              {/* Project Narrative — shown only after AI refinement */}
              {refinedData?.projectNarrative && (
                <DocSection title="Project Narrative">
                  <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                    <p className="text-sm leading-relaxed text-slate-700">
                      {refinedData.projectNarrative}
                    </p>
                  </div>
                </DocSection>
              )}

              {/* Client & Site */}
              <DocSection title="Client &amp; Project Details">
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <User size={13} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Client</p>
                      <p className={`text-sm font-medium ${data.clientName ? 'text-slate-800' : 'text-slate-300 italic font-normal'}`}>
                        {data.clientName || 'Client name not entered'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Site Address</p>
                      <p className={`text-sm ${data.siteAddress ? 'text-slate-700' : 'text-slate-300 italic'}`}>
                        {data.siteAddress || 'Site address not entered'}
                      </p>
                    </div>
                  </div>
                </div>
              </DocSection>

              {/* Project Overview */}
              <DocSection title="Project Overview">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Budget Range</p>
                    {data.budgetRange ? (
                      <span className="inline-flex px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-semibold text-indigo-700">
                        {data.budgetRange}
                      </span>
                    ) : (
                      <p className="text-sm text-slate-300 italic">Not specified</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Primary Motivations</p>
                    <TagList items={data.primaryMotivation} placeholder="No motivations selected" />
                    {refinedData?.motivationStatement && (
                      <p className="text-xs text-slate-500 leading-relaxed mt-2 italic">
                        {refinedData.motivationStatement}
                      </p>
                    )}
                  </div>
                </div>
              </DocSection>

              {/* Design Vision */}
              <DocSection title="Design Vision">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Architectural Style</p>
                    <TagList items={data.architecturalStyles} placeholder="No styles selected" />
                    {refinedData?.designPhilosophy && (
                      <p className="text-sm text-slate-600 leading-relaxed mt-2">
                        {refinedData.designPhilosophy}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Lifestyle Goals</p>
                    <TagList items={data.lifestyleGoals} placeholder="No goals selected" />
                    {refinedData && (refinedData.lifestyleScopeItems?.length ?? 0) > 0 && (
                      <ul className="mt-2.5 space-y-1.5">
                        {(refinedData.lifestyleScopeItems ?? []).map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-indigo-400 mt-2 shrink-0" />
                            <span className="text-xs text-slate-600 leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </DocSection>

              {/* Room Specifications */}
              <DocSection title="Room Specifications">
                <div className="space-y-4">
                  <RoomBlock
                    label="Kitchen"
                    value={data.kitchenNotes}
                    refined={refinedData?.kitchenScope}
                  />
                  <RoomBlock
                    label="Master Bedroom Suite"
                    value={data.masterBedroomNotes}
                    refined={refinedData?.masterBedroomScope}
                  />
                  <RoomBlock
                    label="Living Zones"
                    value={data.livingZoneNotes}
                    refined={refinedData?.livingZoneScope}
                  />
                </div>
              </DocSection>

              {/* Additional Requirements */}
              <DocSection title="Additional Requirements">
                {refinedData?.additionalScope ? (
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[9px] font-bold uppercase tracking-wide text-indigo-500">
                        <Sparkles size={8} />
                        AI Enhanced
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {refinedData.additionalScope}
                    </p>
                  </div>
                ) : (
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${data.additionalNotes ? 'text-slate-700' : 'text-slate-300 italic'}`}>
                    {data.additionalNotes || 'No additional requirements noted.'}
                  </p>
                )}
              </DocSection>

              {/* Signature — shown after generation */}
              {generated && (
                <DocSection title="Client Acknowledgement">
                  {signatureDataUrl ? (
                    <div className="space-y-2">
                      <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 flex justify-center">
                        <img
                          src={signatureDataUrl}
                          alt="Client signature"
                          className="h-20 max-w-xs object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          Signature captured — included in PDF
                        </span>
                        <button
                          type="button"
                          onClick={() => onSignatureChange('')}
                          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          Re-sign
                        </button>
                      </div>
                    </div>
                  ) : (
                    <SignatureField onSignatureChange={onSignatureChange} />
                  )}
                </DocSection>
              )}

              {/* Footer */}
              <AnimatePresence>
                {generated && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="pt-4 border-t border-slate-100"
                  >
                    <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                      Generated by ScopeLock · {generatedDate} · Ref {refNumber}
                      <br />
                      Preliminary brief — subject to design development and formal quotation.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
