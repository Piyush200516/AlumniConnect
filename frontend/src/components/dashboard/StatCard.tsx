import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
  onViewAllClick?: () => void;
}

export default function StatCard({ title, count, icon: Icon, colorScheme, onViewAllClick }: StatCardProps) {
  const schemeClasses = {
    blue: {
      bg: 'bg-blue-600/10 border-blue-500/15 text-blue-400',
      iconContainer: 'bg-blue-600/20 text-blue-400 border border-blue-500/20',
      hoverGlow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/30',
    },
    green: {
      bg: 'bg-emerald-600/10 border-emerald-500/15 text-emerald-400',
      iconContainer: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20',
      hoverGlow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/30',
    },
    purple: {
      bg: 'bg-violet-600/10 border-violet-500/15 text-violet-400',
      iconContainer: 'bg-violet-600/20 text-violet-400 border border-violet-500/20',
      hoverGlow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:border-violet-500/30',
    },
    orange: {
      bg: 'bg-amber-600/10 border-amber-500/15 text-amber-400',
      iconContainer: 'bg-amber-600/20 text-amber-400 border border-amber-500/20',
      hoverGlow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-500/30',
    },
  }[colorScheme];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative flex items-center justify-between rounded-2xl border bg-slate-900/45 p-6 backdrop-blur-xl transition-all duration-300 shadow-md ${schemeClasses.hoverGlow} border-slate-800/80`}
    >
      <div className="flex items-center gap-5">
        {/* Icon Container */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${schemeClasses.iconContainer}`}>
          <Icon className="h-6 w-6" />
        </div>
        {/* Count and Title */}
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">{count}</h3>
          <p className="text-sm text-slate-400 font-medium">{title}</p>
        </div>
      </div>

      {/* View All Link */}
      <button
        onClick={onViewAllClick}
        className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors group cursor-pointer"
      >
        <span>View all</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </motion.div>
  );
}
