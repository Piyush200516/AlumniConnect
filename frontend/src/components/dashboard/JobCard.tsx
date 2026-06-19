import { useState, memo } from 'react';
import { Bookmark, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface JobCardProps {
  title: string;
  companyName: string;
  location: string;
  jobType: 'Internship' | 'Full-time' | 'Contract' | 'Part-time';
  postedTime: string;
  logoUrl: string;
  isSavedInitial?: boolean;
}

const JobCard = memo(function JobCard({ 
  title, 
  companyName, 
  location, 
  jobType, 
  postedTime, 
  logoUrl, 
  isSavedInitial = false 
}: JobCardProps) {
  const [isSaved, setIsSaved] = useState(isSavedInitial);

  const typeColors = {
    'Internship': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Full-time': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Contract': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Part-time': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }[jobType];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-900/50 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-800 transition-all duration-300"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Company Logo Square */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
          <img 
            src={logoUrl} 
            alt={companyName} 
            className="h-full w-full object-contain"
            loading="lazy"
            onError={(e) => {
              // Fallback gradient with initials if image fails
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.className = "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 text-white font-bold text-base border border-slate-700 shadow-md";
                parent.innerText = companyName.charAt(0);
              }
            }}
          />
        </div>

        {/* Job Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-sm text-white hover:text-blue-400 transition-colors truncate cursor-pointer">
              {title}
            </h4>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${typeColors}`}>
              {jobType}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-slate-350">{companyName}</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-0.5 text-slate-400">
              <MapPin className="h-3 w-3 shrink-0 text-slate-500" />
              {location}
            </span>
          </p>
        </div>
      </div>

      {/* Posted Time and Save/Bookmark Button */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-slate-500 font-medium hidden sm:inline flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-slate-655" />
          {postedTime}
        </span>
        <span className="text-[11px] text-slate-500 font-medium sm:hidden">
          {postedTime}
        </span>
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300 cursor-pointer ${
            isSaved 
              ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20' 
              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-850'
          }`}
        >
          <Bookmark className="h-4.5 w-4.5" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.div>
  );
});

export default JobCard;
