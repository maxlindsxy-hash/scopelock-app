import { motion } from 'framer-motion';
import { ChefHat, Bed, Sofa } from 'lucide-react';
import type { ProjectData } from '../../types';

const ROOM_LIMIT = 800;

interface Props {
  data: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
  direction: number;
}

interface RoomSectionProps {
  icon: React.ReactNode;
  title: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

function RoomSection({ icon, title, hint, value, onChange, placeholder }: RoomSectionProps) {
  const pct = value.length / ROOM_LIMIT;
  const showCounter = pct >= 0.6;
  const counterColor =
    pct >= 1 ? 'text-red-500' : pct >= 0.9 ? 'text-amber-500' : 'text-slate-400';
  const borderClass =
    pct >= 1
      ? 'border-red-300 focus:border-red-400'
      : pct >= 0.9
        ? 'border-amber-300 focus:border-amber-400'
        : 'border-slate-200 focus:border-indigo-500';

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{hint}</p>
        </div>
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, ROOM_LIMIT))}
          placeholder={placeholder}
          rows={3}
          maxLength={ROOM_LIMIT}
          className={`w-full px-4 py-3 rounded-xl border-2 ${borderClass} text-slate-900
                     placeholder:text-slate-400 focus:outline-none
                     text-sm resize-none transition-colors bg-white leading-relaxed`}
        />
        {showCounter && (
          <span className={`absolute bottom-2.5 right-3 text-[10px] font-medium tabular-nums pointer-events-none ${counterColor}`}>
            {value.length}/{ROOM_LIMIT}
          </span>
        )}
      </div>
    </div>
  );
}

export function Stage3({ data, onChange, direction }: Props) {
  const enterX = direction > 0 ? '60%' : '-60%';
  const exitX = direction > 0 ? '-60%' : '60%';

  return (
    <motion.div
      initial={{ x: enterX, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: exitX, opacity: 0 }}
      transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="space-y-6"
    >
      <p className="text-sm text-slate-500 -mt-1">
        Capture functional intent and client priorities for each key space.
      </p>

      <RoomSection
        icon={<ChefHat size={18} className="text-indigo-600" />}
        title="Kitchen"
        hint="Layout, appliances, storage, island bench, butler's pantry, etc."
        value={data.kitchenNotes}
        onChange={(v) => onChange({ kitchenNotes: v })}
        placeholder="e.g. Island bench essential, stone benchtops, butler's pantry, fully integrated appliances, north-facing aspect..."
      />

      <RoomSection
        icon={<Bed size={18} className="text-indigo-600" />}
        title="Master Bedroom Suite"
        hint="Ensuite, walk-in robe, orientation, size targets, etc."
        value={data.masterBedroomNotes}
        onChange={(v) => onChange({ masterBedroomNotes: v })}
        placeholder="e.g. Large WIR required, ensuite with double vanity and freestanding bath, north-facing, minimum 5m × 4m..."
      />

      <RoomSection
        icon={<Sofa size={18} className="text-indigo-600" />}
        title="Living Zones"
        hint="Open plan vs. separate, formal lounge, media room, outdoor connection, etc."
        value={data.livingZoneNotes}
        onChange={(v) => onChange({ livingZoneNotes: v })}
        placeholder="e.g. Open plan kitchen/dining/living, separate media room, bi-fold doors to alfresco entertaining area..."
      />
    </motion.div>
  );
}
