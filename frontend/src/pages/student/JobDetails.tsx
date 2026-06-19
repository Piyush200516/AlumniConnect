import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Briefcase, 
  FileText, 
  Send,
  MessageSquare,
  Loader2,
  X,
  ExternalLink,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import api from '../../services/api';
import { useAuthContext } from '../../components/layout/AuthProvider';
import { toastSuccess, toastError } from '../../utils/toast';

interface JobDetailsProps {
  jobId: string;
  onGoBack: () => void;
}

export default function JobDetails({ jobId, onGoBack }: JobDetailsProps) {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [customResumeUrl, setCustomResumeUrl] = useState(profile?.resumeUrl || '');

  // Fetch job details by ID
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['jobDetails', jobId],
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}`);
      return res.data.data;
    }
  });

  // Apply Mutation
  const applyMutation = useMutation({
    mutationFn: async (payload: { coverLetter?: string; resumeUrl: string }) => {
      const res = await api.post(`/jobs/${jobId}/apply`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toastSuccess(data.message || 'Applied successfully!');
      setIsApplyModalOpen(false);
      setCoverLetter('');
      queryClient.invalidateQueries({ queryKey: ['jobDetails', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobsList'] });
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to submit application');
    }
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customResumeUrl.trim()) {
      toastError('Resume URL is required to apply.');
      return;
    }
    applyMutation.mutate({
      coverLetter: coverLetter.trim() || undefined,
      resumeUrl: customResumeUrl.trim()
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-slate-400 text-xs font-semibold">Fetching job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-16 border border-slate-900 rounded-2xl bg-slate-950/20">
        <ArrowLeft className="h-8 w-8 text-slate-500 mx-auto mb-3 cursor-pointer" onClick={onGoBack} />
        <h3 className="text-sm font-bold text-white">Failed to load job details</h3>
        <button onClick={onGoBack} className="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-350 hover:text-white cursor-pointer">
          Go Back
        </button>
      </div>
    );
  }

  const hasApplied = job.applications && job.applications.length > 0;
  const appStatus = hasApplied ? job.applications[0].status : null;
  const isProfileComplete = !!(profile && profile.phone && profile.profileImage);
  const isCdcApproved = profile?.verificationStatus === 'VERIFIED';
  const isEligible = isProfileComplete && isCdcApproved;

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <button 
        onClick={onGoBack}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-300 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to listings
      </button>

      {/* Main Job Hero Header */}
      <div className="relative p-6 md:p-8 rounded-3xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl shadow-xl space-y-6 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        
        {/* Background gradient blur */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-600/10 blur-[60px] pointer-events-none" />

        <div className="flex items-center gap-5">
          {/* Logo container */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-3 border border-slate-850 shadow-md">
            {job.companyLogo ? (
              <img 
                src={job.companyLogo} 
                alt={job.company} 
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.className = "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-800 text-white font-extrabold text-3xl border border-blue-900/20 shadow-md";
                    parent.innerText = job.company.charAt(0).toUpperCase();
                  }
                }}
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-800 text-white font-extrabold text-3xl border border-blue-900/20 shadow-md">
                {job.company.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-white leading-tight">{job.title}</h1>
              {job.approvalStatus === 'APPROVED' && (
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified by CDC
                </span>
              )}
            </div>

            <p className="text-sm font-bold text-slate-350">{job.company}</p>

            <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-400 mt-2 font-medium">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border bg-blue-600/10 border-blue-500/20 text-blue-450">
                {job.jobType === 'FULL_TIME' ? 'Full Time' : job.jobType === 'INTERNSHIP' ? 'Internship' : job.jobType}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" /> {job.location}
                </span>
              )}
              {job.salary && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-slate-500" /> {job.salary}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch md:items-end lg:items-center gap-3 shrink-0">
          {hasApplied ? (
            <div className="flex flex-col gap-1 items-stretch md:items-end">
              <span className="bg-slate-900 border border-slate-800 text-slate-300 px-6 py-3 rounded-2xl text-xs font-black uppercase text-center select-none shadow-md">
                Application: {appStatus}
              </span>
              <p className="text-[10px] text-slate-500 font-semibold text-center md:text-right mt-1">Applied on {new Date(job.applications[0].createdAt).toLocaleDateString()}</p>
            </div>
          ) : job.applicationLink ? (
            <a 
              href={job.applicationLink}
              target="_blank"
              rel="noreferrer"
              className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/15 cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-300"
            >
              Apply Externally
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <button 
              onClick={() => setIsApplyModalOpen(true)}
              className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/15 cursor-pointer transition-all duration-300"
            >
              Apply for Job
            </button>
          )}
        </div>
      </div>

      {/* Two Column Layout details */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 items-start">
        
        {/* Left Column: Full criteria & description */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Description */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Job Description</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Key Responsibilities</h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{job.responsibilities}</p>
            </div>
          )}

          {/* Eligibility */}
          {job.eligibility && (
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Eligibility Criteria</h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{job.eligibility}</p>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Benefits & Perks</h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{job.benefits}</p>
            </div>
          )}

          {/* Selection Process */}
          {job.selectionProcess && (
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Selection Process</h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{job.selectionProcess}</p>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar recruiters / Skills */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Alumni Poster Panel */}
          {job.postedBy?.alumniProfile && (
            <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 space-y-4 shadow-md">
              <h2 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Alumni Recruiter</h2>
              
              <div className="flex items-center gap-3">
                {job.postedBy.alumniProfile.profileImageUrl ? (
                  <img 
                    src={job.postedBy.alumniProfile.profileImageUrl} 
                    alt="" 
                    className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-800"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-base text-slate-400 border border-slate-800 shrink-0">
                    {job.postedBy.alumniProfile.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="min-w-0">
                  <p className="font-extrabold text-white text-sm truncate flex items-center gap-1">
                    {job.postedBy.alumniProfile.fullName}
                    <span className="text-xs text-blue-400">✓</span>
                  </p>
                  <p className="text-xs text-slate-450 truncate mt-0.5">
                    {job.postedBy.alumniProfile.designation}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    at {job.postedBy.alumniProfile.currentCompany || 'AlumniConnect'}
                  </p>
                </div>
              </div>

              {job.postedBy.alumniProfile.bio && (
                <p className="text-xs text-slate-450 leading-relaxed italic border-t border-slate-900 pt-2.5">
                  "{job.postedBy.alumniProfile.bio}"
                </p>
              )}

              <div className="flex gap-2 pt-2 border-t border-slate-900">
                {job.postedBy.alumniProfile.linkedinUrl && (
                  <a 
                    href={job.postedBy.alumniProfile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
                  >
                    <FaLinkedin className="h-4 w-4" />
                  </a>
                )}
                
                <button 
                  onClick={() => toastSuccess(`Initiating conversation with ${job.postedBy.alumniProfile?.fullName}`)}
                  className="flex-1 px-3 py-2 border border-slate-850 hover:bg-slate-900 rounded-lg text-xs font-bold text-slate-350 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="h-4 w-4" /> Message
                </button>
              </div>
            </div>
          )}

          {/* Required Skills Checklist */}
          <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 space-y-4 shadow-md">
            <h2 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-350">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Job Deadlines Panel */}
          <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 space-y-4 shadow-md text-xs">
            <h2 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Opportunity Timeline</h2>
            
            <div className="space-y-3.5 font-semibold text-slate-350">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-slate-500" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Posted On</span>
                  <span>{new Date(job.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {job.deadline && (
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Apply Deadline</span>
                    <span className="text-rose-400">{new Date(job.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* APPLY JOB DIALOG MODAL */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsApplyModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl text-slate-200 z-10 space-y-6">
            
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Apply for {job.title}</h3>
                  <p className="text-xs text-slate-400">at {job.company}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsApplyModalOpen(false)} 
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Check Eligibility */}
            {!isEligible ? (
              <div className="p-4 bg-rose-500/5 border border-rose-500/15 rounded-xl space-y-2.5 text-xs text-slate-350">
                <p className="font-bold text-rose-450 uppercase tracking-wide">Eligibility Check Failure</p>
                <p className="leading-relaxed">You must complete your student profile and have your portal registration application **verified and approved by the CDC** before you can apply for jobs.</p>
                
                <div className="space-y-1 font-semibold">
                  <p className="flex items-center gap-1.5">
                    <span className={isProfileComplete ? 'text-emerald-400' : 'text-rose-400'}>
                      {isProfileComplete ? '✓' : '✗'}
                    </span>
                    Profile completion (Bio, Profile picture, Phone)
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className={isCdcApproved ? 'text-emerald-400' : 'text-rose-400'}>
                      {isCdcApproved ? '✓' : '✗'}
                    </span>
                    CDC Verification Status ({profile?.verificationStatus || 'PENDING'})
                  </p>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setIsApplyModalOpen(false)}
                    className="w-full py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Close Dialog
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-5 text-xs">
                
                {/* Resume field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resume Document Link (PDF) *</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                    <input 
                      type="text"
                      required
                      placeholder="https://cloudinary.com/..."
                      value={customResumeUrl}
                      onChange={(e) => setCustomResumeUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs placeholder-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Defaults to the verified resume from your portal profile summary.</p>
                </div>

                {/* Cover letter field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cover Letter (Optional)</label>
                  <textarea 
                    rows={5}
                    maxLength={1000}
                    placeholder="Briefly pitch why you are a great fit for this role (max 1000 characters)..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs placeholder-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                  <div className="text-right text-[10px] text-slate-550 font-bold">
                    {coverLetter.length}/1000
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-900">
                  <button 
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={applyMutation.isPending}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-500/10 select-none"
                  >
                    {applyMutation.isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
