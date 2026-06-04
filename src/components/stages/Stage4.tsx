import { motion } from 'framer-motion';
import { MessageSquarePlus } from 'lucide-react';
import type { ProjectData } from '../../types';

const NOTES_LIMIT = 1500;

interface Props {
  data: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
  direction: number;
}

export function Stage4({ data, onChange, direction }: Props) {
  const enterX = direction > 0 ? '60%' : '-60%';
  const exitX = direction > 0 ? '-60%' : '60%';

  const pct = data.additionalNotes.length / NOTES_LIMIT;
  const showCounter = pct >= 0.6;
  const counterColor =
    pct >= 1 ? 'text-red-500' : pct >= 0.9 ? 'text-amber-500' : 'text-slate-400';
  const borderClass =
    pct >= 1
      ? 'border-red-300 focus:border-red-400'
      : pct >= 0.9
        ? 'border-amber-300 focus:border-amber-400'
        : 'border-indigo-100 focus:border-indigo-400';

  return (
    <motion.div
      initial={{ x: enterX, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: exitX, opacity: 0 }}
      transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="space-y-5"
    >
      <div className="rounded-2xl bg-indigo-50 border-2 border-indigo-100 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <MessageSquarePlus size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              Additional Client Requirements &amp; Custom Notes
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Include any unique requirements, site constraints, special considerations,
              or ideas discussed during this meeting. This section appears verbatim in
              the final brief.
            </p>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={data.additionalNotes}
            onChange={(e) => onChange({ additionalNotes: e.target.value.slice(0, NOTES_LIMIT) })}
            placeholder="e.g. Heritage overlay applies to front facade — no visible changes to street elevation. Garage must accommodate 3 cars. Client strongly prefers polished concrete floors throughout ground level. Future pool area to be considered in structural design. Existing 80-year-old Jacaranda tree to be retained. Client has existing material samples for stone and joinery finishes..."
            rows={9}
            maxLength={NOTES_LIMIT}
            className={`w-full px-4 py-3.5 rounded-xl border-2 ${borderClass} text-slate-900
                       placeholder:text-slate-400 focus:outline-none
                       text-sm resize-none transition-colors bg-white leading-relaxed`}
          />
          {showCounter && (
            <span className={`absolute bottom-3 right-3 text-[10px] font-medium tabular-nums pointer-events-none ${counterColor}`}>
              {data.additionalNotes.length}/{NOTES_LIMIT}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-600">Almost there.</span> Review your
          notes above, then tap{' '}
          <span className="font-semibold text-indigo-600">Generate Project Brief</span> to
          compile everything into a professional, print-ready document.
        </p>
      </div>
    </motion.div>
  );
}
