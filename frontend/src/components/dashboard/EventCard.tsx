import { memo } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface EventCardProps {
  title: string;
  organizer: string;
  date: string;
  time: string;
  imageUrl: string;
  location?: string;
}

const EventCard = memo(function EventCard({ title, organizer, date, time, imageUrl, location }: EventCardProps) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-900/50 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-800 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        {/* Event Thumbnail */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-850">
          <img 
            src={imageUrl} 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" 
            onError={(e) => {
              // Fallback placeholder gradient if image fails to load
              e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&auto=format&fit=crop&q=60";
            }}
            loading="lazy"
          />
        </div>

        {/* Event Details */}
        <div className="min-w-0">
          <h4 className="font-semibold text-sm text-white hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer">
            {title}
          </h4>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
            {organizer}
          </p>
          {location && (
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>
      </div>

      {/* Date and Time (Right Aligned on desktop) */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t border-slate-900/50 pt-2 sm:pt-0 sm:border-0 shrink-0">
        <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/15">
          <Calendar className="h-3 w-3 sm:hidden" />
          {date}
        </span>
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
          <Clock className="h-3 w-3 text-slate-500" />
          {time}
        </span>
      </div>
    </motion.div>
  );
});

export default EventCard;
