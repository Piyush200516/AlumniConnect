import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Bookmark, 
  ChevronRight, 
  SlidersHorizontal,
  Briefcase, 
  Loader2,
  Award
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { toastSuccess, toastError } from '../../utils/toast';

interface AlumniProfile {
  fullName: string;
  profileImageUrl: string | null;
  designation: string | null;
  currentCompany: string | null;
}

interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  companyLogo: string | null;
  location: string | null;
  salary: string | null;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'FREELANCE' | 'REMOTE';
  skillsRequired: string[];
  deadline: string | null;
  isActive: boolean;
  createdAt: string;
  responsibilities: string | null;
  eligibility: string | null;
  benefits: string | null;
  selectionProcess: string | null;
  applicationLink: string | null;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks: string | null;
  postedBy: {
    role: string;
    email: string;
    alumniProfile: AlumniProfile | null;
  };
  savedBy: any[];
  applications: any[];
}

interface JobsPageProps {
  onSelectJob: (jobId: string) => void;
}

export default function JobsPage({ onSelectJob }: JobsPageProps) {
  const queryClient = useQueryClient();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedSalary, setSelectedSalary] = useState('ALL');
  const [selectedSkill, setSelectedSkill] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'applied'>('all');

  // React Query: Fetch Jobs
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['jobsList', activeTab],
    queryFn: async () => {
      const res = await api.get('/jobs', {
        params: { tab: activeTab }
      });
      return res.data.data || [];
    }
  });

  // Bookmark Mutation
  const bookmarkMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const res = await api.post(`/jobs/${jobId}/save`);
      return res.data;
    },
    onSuccess: (data) => {
      toastSuccess(data.message);
      queryClient.invalidateQueries({ queryKey: ['jobsList'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update bookmark');
    }
  });

  // Extract unique locations and skills for dropdown filters from jobs data
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    jobs.forEach(j => {
      if (j.location) locSet.add(j.location);
    });
    return ['ALL', ...Array.from(locSet)];
  }, [jobs]);

  const skills = useMemo(() => {
    const skillSet = new Set<string>();
    jobs.forEach(j => {
      j.skillsRequired.forEach(s => skillSet.add(s));
    });
    return ['ALL', ...Array.from(skillSet)];
  }, [jobs]);

  // Client-side search and filtering
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search query
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(query) ||
        j.company.toLowerCase().includes(query) ||
        j.description.toLowerCase().includes(query) ||
        j.skillsRequired.some(s => s.toLowerCase().includes(query))
      );
    }

    // Job Type filter (Internship, Full Time, Part Time, Remote etc)
    if (selectedJobType !== 'ALL') {
      if (selectedJobType === 'REMOTE') {
        result = result.filter(j => j.jobType === 'REMOTE' || j.location?.toLowerCase().includes('remote'));
      } else {
        result = result.filter(j => j.jobType === selectedJobType);
      }
    }

    // Location filter
    if (selectedLocation !== 'ALL') {
      result = result.filter(j => j.location === selectedLocation);
    }

    // Skill filter
    if (selectedSkill !== 'ALL') {
      result = result.filter(j => j.skillsRequired.includes(selectedSkill));
    }

    // Salary filter ranges
    if (selectedSalary !== 'ALL') {
      result = result.filter(j => {
        if (!j.salary) return false;
        const val = j.salary.toLowerCase();
        if (selectedSalary === 'stipend') {
          return val.includes('stipend') || val.includes('month') || val.includes('/mo');
        } else if (selectedSalary === 'lpa') {
          return val.includes('lpa') || val.includes('lakh') || val.includes('per annum');
        }
        return true;
      });
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'deadline') {
      result.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    }

    return result;
  }, [jobs, searchTerm, selectedJobType, selectedLocation, selectedSalary, selectedSkill, sortBy]);

  // Compute Statistics Overview locally
  const stats = useMemo(() => {
    // We compute these based on all jobs or default values
    const totalCount = jobs.length;
    const activeInternships = jobs.filter(j => j.jobType === 'INTERNSHIP').length;
    const activeJobs = jobs.filter(j => j.jobType !== 'INTERNSHIP').length;
    const appliedJobs = jobs.filter(j => j.applications && j.applications.length > 0).length;
    const shortlisted = jobs.filter(j => j.applications && j.applications.some(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW' || a.status === 'OFFERED')).length;
    const offers = jobs.filter(j => j.applications && j.applications.some(a => a.status === 'OFFERED')).length;

    return { totalCount, activeInternships, activeJobs, appliedJobs, shortlisted, offers };
  }, [jobs]);

  // Extract recent Alumni who posted jobs
  const alumniPosters = useMemo(() => {
    const list: any[] = [];
    const ids = new Set<string>();
    jobs.forEach(j => {
      if (j.postedBy && j.postedBy.alumniProfile && !ids.has(j.postedBy.email)) {
        ids.add(j.postedBy.email);
        list.push({
          fullName: j.postedBy.alumniProfile.fullName,
          profileImageUrl: j.postedBy.alumniProfile.profileImageUrl,
          designation: j.postedBy.alumniProfile.designation,
          currentCompany: j.postedBy.alumniProfile.currentCompany,
          jobsCount: jobs.filter(x => x.postedBy.email === j.postedBy.email).length
        });
      }
    });
    return list.slice(0, 3); // limit to 3 alumni
  }, [jobs]);

  const handleBookmarkToggle = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    bookmarkMutation.mutate(jobId);
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'Full Time';
      case 'PART_TIME': return 'Part Time';
      case 'INTERNSHIP': return 'Internship';
      case 'CONTRACT': return 'Contract';
      case 'FREELANCE': return 'Freelance';
      case 'REMOTE': return 'Remote';
      default: return type;
    }
  };

  const getJobTypeColors = (type: string) => {
    switch (type) {
      case 'INTERNSHIP':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'FULL_TIME':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'REMOTE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="grid gap-8 grid-cols-1 xl:grid-cols-12 items-start">
      
      {/* Left Column: Job Cards List & Filters */}
      <div className="xl:col-span-8 space-y-6">
        
        {/* Module Sub-navigation tabs (Browse / Bookmarked / Applied) */}
        <div className="flex border-b border-slate-900 pb-px">
          {(['all', 'saved', 'applied'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all duration-300 relative ${
                activeTab === tab 
                  ? 'border-blue-500 text-blue-400 font-extrabold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all' && 'Browse Jobs'}
              {tab === 'saved' && 'Saved Jobs'}
              {tab === 'applied' && 'Applied Tracking'}
              
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTabUnderline" 
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Filter Toolbar Card */}
        <div className="p-5 rounded-2xl border border-slate-900/80 bg-slate-950/40 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by role, company, skills, or alumni..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-850 rounded-xl text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 text-slate-200 transition-all duration-300"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase rounded-xl border cursor-pointer transition-all ${
                  showAdvancedFilters 
                    ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' 
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-slate-900/40 border border-slate-850 rounded-xl text-xs font-bold text-slate-400 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="deadline">Sort: Deadline</option>
              </select>
            </div>
          </div>

          {/* Expandable Advanced Filters Panel */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-slate-900/80 pt-4 grid gap-4 grid-cols-1 sm:grid-cols-3"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">All Locations</option>
                    {locations.filter(l => l !== 'ALL').map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Salary Type</label>
                  <select
                    value={selectedSalary}
                    onChange={(e) => setSelectedSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">All Salaries</option>
                    <option value="stipend">Monthly Stipend</option>
                    <option value="lpa">CTC (Lakhs per Annum)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Required Skill</label>
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">All Skills</option>
                    {skills.filter(s => s !== 'ALL').map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Filter Tag Chips */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-900/30">
            {[
              { id: 'ALL', label: 'All Opportunities' },
              { id: 'INTERNSHIP', label: 'Internships' },
              { id: 'FULL_TIME', label: 'Full Time' },
              { id: 'PART_TIME', label: 'Part Time' },
              { id: 'REMOTE', label: 'Remote / WFH' }
            ].map(chip => (
              <button
                key={chip.id}
                onClick={() => setSelectedJobType(chip.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all duration-300 ${
                  selectedJobType === chip.id 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                    : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-750'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List Grid */}
        {isLoading ? (
          <div className="flex h-[35vh] flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
            <p className="text-slate-500 text-xs font-semibold">Syncing job directory...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-900 rounded-3xl p-6 bg-slate-950/10">
            <Briefcase className="h-10 w-10 text-slate-800 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Opportunities Found</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">Try refining your search terms or checking different filter conditions.</p>
          </div>
        ) : (
          <div className="space-y-4.5">
            {filteredJobs.map((job) => {
              const hasApplied = job.applications && job.applications.length > 0;
              const isSaved = job.savedBy && job.savedBy.length > 0;
              const appStatus = hasApplied ? job.applications[0].status : null;

              return (
                <motion.div
                  key={job.id}
                  whileHover={{ y: -2 }}
                  onClick={() => onSelectJob(job.id)}
                  className="relative p-5 rounded-2xl border border-slate-900 bg-slate-950/30 hover:border-slate-800/80 hover:bg-slate-900/20 shadow-lg cursor-pointer transition-all duration-300 flex flex-col gap-4"
                >
                  {/* Top row: Logo, Title, and Verification Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Logo Square */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white p-2 border border-slate-900/60 shadow-md">
                        {job.companyLogo ? (
                          <img 
                            src={job.companyLogo} 
                            alt={job.company} 
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.className = "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-850 text-white font-black text-xl border border-blue-900/30 shadow-md";
                                parent.innerText = job.company.charAt(0).toUpperCase();
                              }
                            }}
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-850 text-white font-black text-xl border border-blue-900/30 shadow-md">
                            {job.company.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Job Title and Company check */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-white text-base hover:text-blue-400 leading-snug transition-colors truncate">
                            {job.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mt-1">
                          <span className="text-slate-300 font-bold">{job.company}</span>
                          {job.approvalStatus === 'APPROVED' && (
                            <span className="inline-flex items-center justify-center h-4.5 w-4.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* CDC Badge */}
                      {job.approvalStatus === 'APPROVED' ? (
                        <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase select-none">
                          <Award className="h-3 w-3 shrink-0" /> Verified by CDC
                        </span>
                      ) : (
                        <span className="hidden sm:inline-flex items-center bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase select-none">
                          Awaiting Review
                        </span>
                      )}

                      {/* Save Button */}
                      <button
                        onClick={(e) => handleBookmarkToggle(job.id, e)}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
                          isSaved 
                            ? 'bg-blue-600/10 border-blue-500/35 text-blue-400 hover:bg-blue-600/20' 
                            : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Mid: Posted by Alumni Section */}
                  {job.postedBy?.alumniProfile && (
                    <div className="p-2.5 rounded-xl bg-slate-900/25 border border-slate-900/60 flex items-center gap-2.5 self-start text-xs max-w-full">
                      {job.postedBy.alumniProfile.profileImageUrl ? (
                        <img 
                          src={job.postedBy.alumniProfile.profileImageUrl} 
                          alt="" 
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-850"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-450 border border-slate-850 shrink-0">
                          {job.postedBy.alumniProfile.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-slate-450 leading-none">
                          Posted by <span className="font-semibold text-slate-200">{job.postedBy.alumniProfile.fullName}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {job.postedBy.alumniProfile.designation} at {job.postedBy.alumniProfile.currentCompany || 'AlumniConnect'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Skills Section */}
                  <div className="flex flex-wrap gap-1.5">
                    {job.skillsRequired.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-0.5 bg-slate-900 border border-slate-850/80 rounded-md text-[10px] font-bold text-slate-400">
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-900/50 text-[10px] font-semibold text-slate-500">
                        +{job.skillsRequired.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Bottom Row: Metadata badges & Apply details */}
                  <div className="border-t border-slate-900/60 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3.5 text-slate-450 font-medium">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getJobTypeColors(job.jobType)}`}>
                        {getJobTypeLabel(job.jobType)}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-600" />
                          {job.location}
                        </span>
                      )}
                      {job.salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-slate-600" />
                          {job.salary}
                        </span>
                      )}
                      {job.deadline && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="h-3.5 w-3.5 text-slate-600" />
                          Apply by {new Date(job.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Application status pipeline tags */}
                      {hasApplied && (
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase border select-none ${
                          appStatus === 'OFFERED' ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/25' :
                          appStatus === 'REJECTED' ? 'bg-rose-500/10 text-rose-450 border-rose-500/25' :
                          appStatus === 'SHORTLISTED' || appStatus === 'INTERVIEW' ? 'bg-blue-500/10 text-blue-450 border-blue-500/25 shadow-[0_0_10px_rgba(59,130,246,0.1)]' :
                          'bg-slate-900 text-slate-400 border-slate-850'
                        }`}>
                          Status: {appStatus}
                        </span>
                      )}
                      
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 cursor-pointer flex items-center gap-1">
                        View Details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Sidebar Statistics & Suggested Postings */}
      <div className="xl:col-span-4 space-y-8">
        
        {/* Widget 1: Opportunities Overview */}
        <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-5 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white tracking-wider uppercase">Opportunities Overview</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Opportunities</span>
              <p className="text-xl font-black text-white">{stats.totalCount}</p>
            </div>
            <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Active Internships</span>
              <p className="text-xl font-black text-emerald-400">{stats.activeInternships}</p>
            </div>
            <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Active Jobs</span>
              <p className="text-xl font-black text-blue-400">{stats.activeJobs}</p>
            </div>
            <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Applied Jobs</span>
              <p className="text-xl font-black text-indigo-400">{stats.appliedJobs}</p>
            </div>
            <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Shortlisted</span>
              <p className="text-xl font-black text-purple-400">{stats.shortlisted}</p>
            </div>
            <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Offers Received</span>
              <p className="text-xl font-black text-amber-400">{stats.offers}</p>
            </div>
          </div>
        </div>

        {/* Widget 2: Recommended for You */}
        <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-5 backdrop-blur-xl space-y-4 shadow-xl">
          <h2 className="text-sm font-extrabold text-white tracking-wider uppercase">Recommended For You</h2>
          
          <div className="space-y-3">
            {filteredJobs.slice(0, 2).map((recJob) => (
              <div 
                key={`rec-${recJob.id}`} 
                onClick={() => onSelectJob(recJob.id)}
                className="p-3.5 rounded-xl border border-slate-900 bg-slate-900/10 hover:border-slate-800 hover:bg-slate-900/35 transition-all cursor-pointer space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs truncate hover:text-blue-400">{recJob.title}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{recJob.company}</p>
                  </div>
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0">
                    Recommended
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-900/40">
                  <span>{getJobTypeLabel(recJob.jobType)}</span>
                  <span>{recJob.salary || 'Best in Industry'}</span>
                </div>
              </div>
            ))}
            {filteredJobs.length === 0 && (
              <p className="text-xs text-slate-500 italic py-2 text-center">No recommendations available.</p>
            )}
          </div>
        </div>

        {/* Widget 3: Jobs Posted by Alumni Directory */}
        <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-5 backdrop-blur-xl space-y-4 shadow-xl">
          <h2 className="text-sm font-extrabold text-white tracking-wider uppercase">Alumni Contributors</h2>
          
          <div className="space-y-4">
            {alumniPosters.map((poster, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3.5 p-2 rounded-xl bg-slate-900/20 border border-slate-900">
                <div className="flex items-center gap-2.5 min-w-0">
                  {poster.profileImageUrl ? (
                    <img src={poster.profileImageUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-800" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-450 border border-slate-800 shrink-0">
                      {poster.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-white text-xs truncate flex items-center gap-1">
                      {poster.fullName}
                      <span className="text-[10px] text-blue-400">✓</span>
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{poster.designation} at {poster.currentCompany}</p>
                    <p className="text-[9px] text-slate-550 font-bold uppercase mt-1">{poster.jobsCount} Opportunities Posted</p>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toastSuccess(`Chat option under development - connecting with ${poster.fullName}`);
                  }}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-850 hover:bg-blue-600 hover:text-white rounded-lg text-[9px] font-bold text-slate-350 cursor-pointer shrink-0 transition-colors"
                >
                  Connect
                </button>
              </div>
            ))}
            {alumniPosters.length === 0 && (
              <p className="text-xs text-slate-500 italic py-2 text-center">No active alumni recruiters found.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
