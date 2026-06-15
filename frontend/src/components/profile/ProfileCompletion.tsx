import { CheckCircle2, Circle } from 'lucide-react';

interface ProfileCompletionProps {
  profile: {
    fullName: string;
    enrollmentNumber: string;
    branch: string;
    course: string;
    graduationYear: number;
    email: string;
    phone: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    skills: string[];
    resumeUrl: string | null;
  };
}

export default function ProfileCompletion({ profile }: ProfileCompletionProps) {
  // Checklist items mapping
  const items = [
    {
      name: 'Basic Details (30%)',
      desc: 'Name, Enrollment No., Branch, Graduation Year',
      isComplete: !!(
        profile.fullName &&
        profile.enrollmentNumber &&
        profile.branch &&
        profile.course &&
        profile.graduationYear
      ),
      weight: '30%',
    },
    {
      name: 'Contact Details (20%)',
      desc: 'College Email and Mobile Number',
      isComplete: !!(profile.email && profile.phone),
      weight: '20%',
    },
    {
      name: 'Social Links (20%)',
      desc: 'LinkedIn and GitHub profiles',
      isComplete: !!(profile.linkedinUrl && profile.githubUrl),
      weight: '20%',
    },
    {
      name: 'Professional Skills (15%)',
      desc: 'Add at least one technical or professional skill',
      isComplete: profile.skills && profile.skills.length > 0,
      weight: '15%',
    },
    {
      name: 'Resume Upload (15%)',
      desc: 'Upload a PDF version of your resume',
      isComplete: !!profile.resumeUrl,
      weight: '15%',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg shadow-black/10 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          Profile Setup Checklist
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Complete your profile to increase visibility to recruiters and alumni.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-colors duration-300 ${
              item.isComplete
                ? 'border-emerald-500/10 bg-emerald-500/5 text-emerald-400'
                : 'border-slate-850 bg-slate-900/10 text-slate-400'
            }`}
          >
            {item.isComplete ? (
              <CheckCircle2 className="w-5.5 h-5.5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5.5 h-5.5 text-slate-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-bold truncate ${item.isComplete ? 'text-emerald-300' : 'text-slate-300'}`}>
                  {item.name}
                </span>
                <span className="text-xs font-semibold shrink-0">{item.weight}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
