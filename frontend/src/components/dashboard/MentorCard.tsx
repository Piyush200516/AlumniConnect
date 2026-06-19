import { useState, memo } from 'react';
import { UserCheck, UserPlus, CheckCircle2 } from 'lucide-react';

interface MentorCardProps {
  name: string;
  designation: string;
  company: string;
  expertise: string;
  avatarUrl: string;
  isPendingInitial?: boolean;
}

const MentorCard = memo(function MentorCard({
  name,
  designation,
  company,
  expertise,
  avatarUrl,
  isPendingInitial = false,
}: MentorCardProps) {
  const [isConnected, setIsConnected] = useState(isPendingInitial);
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    if (isConnected) return;
    setLoading(true);
    // Simulate connection API call
    setTimeout(() => {
      setIsConnected(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-900/50 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-800 transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Mentor Avatar */}
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-850">
          <img 
            src={avatarUrl} 
            alt={name} 
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback placeholder image
              e.currentTarget.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
            }}
          />
        </div>

        {/* Mentor Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-semibold text-sm text-white hover:text-blue-400 transition-colors cursor-pointer">
              {name}
            </h4>
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10 shrink-0" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {designation} at <span className="font-semibold text-slate-350">{company}</span>
          </p>
          <p className="text-xs text-slate-500 mt-2 font-medium bg-slate-900/40 px-2.5 py-1 rounded-lg border border-slate-850 inline-block">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mr-1">Expertise:</span>
            <span className="text-slate-350">{expertise}</span>
          </p>
        </div>
      </div>

      {/* Action Connect Button */}
      <div className="shrink-0 flex justify-end">
        <button
          onClick={handleConnect}
          disabled={loading}
          className={`px-4 py-2 text-xs font-semibold rounded-xl border flex items-center gap-2 cursor-pointer transition-all duration-300 shadow-md ${
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 cursor-default'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500/20 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/15 hover:shadow-lg'
          }`}
        >
          {loading ? (
            <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isConnected ? (
            <>
              <UserCheck className="h-3.5 w-3.5" />
              Connected
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Connect
            </>
          )}
        </button>
      </div>
    </div>
  );
});

export default MentorCard;
