import JobCard from '../JobCard';

interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string | null;
  jobType: string;
  createdAt: string;
}

interface JobsSectionProps {
  jobs: JobItem[];
  loading: boolean;
}

export default function JobsSection({ jobs, loading }: JobsSectionProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-slate-900 bg-slate-900/10 p-4 animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-10 w-10 rounded-lg bg-slate-850 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 bg-slate-850 rounded" />
                <div className="h-3 w-1/3 bg-slate-850 rounded" />
              </div>
            </div>
            <div className="h-8 w-8 bg-slate-850 rounded shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return <p className="text-xs text-slate-550 italic py-2">No active job listings found.</p>;
  }

  const mapJobType = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'Full-time';
      case 'PART_TIME': return 'Part-time';
      case 'INTERNSHIP': return 'Internship';
      case 'CONTRACT': return 'Contract';
      default: return 'Full-time';
    }
  };

  const getPostedTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return '1d ago';
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col gap-3.5">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          title={job.title}
          companyName={job.company}
          location={job.location || 'Remote'}
          jobType={mapJobType(job.jobType)}
          postedTime={getPostedTime(job.createdAt)}
          logoUrl={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(job.company)}&backgroundColor=0d1e3a`}
        />
      ))}
    </div>
  );
}
