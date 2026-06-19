import MentorCard from '../MentorCard';

interface MentorItem {
  id: string;
  fullName: string;
  designation: string | null;
  currentCompany: string | null;
  skills: string[];
  profileImageUrl: string | null;
}

interface MentorshipSectionProps {
  mentors: MentorItem[];
  loading: boolean;
}

export default function MentorshipSection({ mentors, loading }: MentorshipSectionProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-slate-900 bg-slate-900/10 p-4 animate-pulse flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-850 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-slate-850 rounded" />
              <div className="h-3 w-1/2 bg-slate-850 rounded" />
            </div>
            <div className="h-8 w-20 bg-slate-850 rounded shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (mentors.length === 0) {
    return <p className="text-xs text-slate-550 italic py-2">No suggested mentors available right now.</p>;
  }

  return (
    <div className="flex flex-col gap-3.5">
      {mentors.map((mentor) => (
        <MentorCard
          key={mentor.id}
          name={mentor.fullName}
          designation={mentor.designation || 'Alumni Mentor'}
          company={mentor.currentCompany || 'Industry Partner'}
          expertise={mentor.skills.slice(0, 3).join(', ') || 'Career Growth'}
          avatarUrl={mentor.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mentor.fullName)}`}
        />
      ))}
    </div>
  );
}
