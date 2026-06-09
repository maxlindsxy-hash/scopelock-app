import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Hash,
  ImagePlus,
  Trash2,
  Link,
} from 'lucide-react';
import type { ContractorProfile } from '../types';

interface Props {
  profile: ContractorProfile;
  onChange: (profile: ContractorProfile) => void;
  onClose: () => void;
}

interface FieldProps {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}

function Field({ icon, label, placeholder, value, onChange, type = 'text', hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
        <span className="text-indigo-400">{icon}</span>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 bg-white
                   text-sm text-slate-900 placeholder:text-slate-400
                   focus:border-indigo-500 focus:outline-none transition-colors"
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function ContractorSetup({ profile, onChange, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof ContractorProfile, value: string) => {
    onChange({ ...profile, [key]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update('logoDataUrl', (ev.target?.result as string) ?? '');
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed right-0 inset-y-0 z-50 w-full max-w-md bg-white shadow-2xl
                   flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900">Contractor Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your details appear on every generated brief
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center
                       hover:bg-slate-200 active:bg-slate-300 transition-colors"
          >
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Logo upload */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
              <ImagePlus size={13} className="text-indigo-400" />
              Company Logo
            </label>

            {profile.logoDataUrl ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 bg-slate-50">
                <img
                  src={profile.logoDataUrl}
                  alt="Logo preview"
                  className="w-14 h-14 rounded-lg object-contain bg-white border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700">Logo uploaded</p>
                  <p className="text-xs text-slate-400 mt-0.5">Will appear on the PDF header</p>
                </div>
                <button
                  onClick={() => update('logoDataUrl', '')}
                  className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center
                             hover:bg-red-100 transition-colors shrink-0"
                >
                  <Trash2 size={13} className="text-red-500" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 py-5 rounded-xl border-2
                           border-dashed border-slate-200 bg-slate-50 hover:border-indigo-300
                           hover:bg-indigo-50/30 transition-all text-slate-500"
              >
                <ImagePlus size={20} className="text-slate-300" />
                <span className="text-xs font-medium">Tap to upload logo</span>
                <span className="text-xs text-slate-400">PNG, JPG, SVG · Max 2MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          <div className="h-px bg-slate-100" />

          <Field
            icon={<Building2 size={13} />}
            label="Company Name"
            placeholder="e.g. Mitchell Building Co."
            value={profile.companyName}
            onChange={(v) => update('companyName', v)}
          />

          <Field
            icon={<User size={13} />}
            label="Contact Name"
            placeholder="e.g. James Mitchell"
            value={profile.contactName}
            onChange={(v) => update('contactName', v)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              icon={<Phone size={13} />}
              label="Phone"
              placeholder="0400 123 456"
              value={profile.phone}
              onChange={(v) => update('phone', v)}
              type="tel"
            />
            <Field
              icon={<Mail size={13} />}
              label="Email"
              placeholder="info@company.com.au"
              value={profile.email}
              onChange={(v) => update('email', v)}
              type="email"
            />
          </div>

          <Field
            icon={<Globe size={13} />}
            label="Website"
            placeholder="www.mitchellbuilding.com.au"
            value={profile.website}
            onChange={(v) => update('website', v)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              icon={<ShieldCheck size={13} />}
              label="Licence No."
              placeholder="CBXXXXXX"
              value={profile.licenseNumber}
              onChange={(v) => update('licenseNumber', v)}
              hint="Builders licence"
            />
            <Field
              icon={<Hash size={13} />}
              label="ABN"
              placeholder="XX XXX XXX XXX"
              value={profile.abn}
              onChange={(v) => update('abn', v)}
            />
          </div>

          <div className="h-px bg-slate-100" />

          <Field
            icon={<Link size={13} />}
            label="Intake Portal Slug"
            placeholder="e.g. apex-builds"
            value={profile.tenantSlug}
            onChange={(v) => update('tenantSlug', v.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
            hint={profile.tenantSlug
              ? `Client intake URL: /…/${profile.tenantSlug}/intake`
              : 'Used to receive client submissions from your public intake link'}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm
                       hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            Save Profile
          </button>
          <p className="text-xs text-slate-400 text-center mt-2">
            Profile is saved locally on this device
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
