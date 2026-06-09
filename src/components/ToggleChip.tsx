import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ToggleChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function ToggleChip({ label, selected, onToggle }: ToggleChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
      className={`
        inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
        border-2 transition-colors duration-150 select-none touch-manipulation min-h-[44px]
        ${selected
          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50 active:bg-slate-100'
        }
      `}
    >
      <span className={`w-4 h-4 flex items-center justify-center shrink-0 transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`}>
        <Check size={13} className="text-indigo-600" />
      </span>
      {label}
    </motion.button>
  );
}
