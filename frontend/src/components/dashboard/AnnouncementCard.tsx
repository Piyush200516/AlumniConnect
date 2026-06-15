import { motion } from 'framer-motion';

interface AnnouncementCardProps {
  title: string;
  description: string;
  timestamp: string;
  statusColor: 'green' | 'purple' | 'orange' | 'blue';
}

export default function AnnouncementCard({ title, description, timestamp, statusColor }: AnnouncementCardProps) {
  const dotColors = {
    green: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    purple: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]',
    orange: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    blue: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
  }[statusColor];

  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-900/50 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-800 transition-all duration-300"
    >
      <div className="flex gap-3.5 min-w-0">
        {/* Color Dot Status Indicator */}
        <div className="pt-2 shrink-0">
          <span className={`block h-2.5 w-2.5 rounded-full ${dotColors}`} />
        </div>

        {/* Text Details */}
        <div className="min-w-0">
          <h4 className="font-semibold text-sm text-white hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer">
            {title}
          </h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Timestamp */}
      <span className="text-[11px] font-medium text-slate-500 shrink-0 select-none pt-0.5">
        {timestamp}
      </span>
    </motion.div>
  );
}
