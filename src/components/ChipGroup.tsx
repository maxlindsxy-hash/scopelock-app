import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.18,
    },
  },
};

export const chipItemVariants = {
  hidden: { opacity: 0, scale: 0.82, y: 6 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 18, stiffness: 340 },
  },
};

interface Props {
  children: ReactNode;
  className?: string;
}

export function ChipGroup({ children, className = '' }: Props) {
  return (
    <motion.div
      className={`flex flex-wrap gap-2.5 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}
