import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Calendar, 
  GraduationCap, 
  Award, 
  Globe, 
  MessageSquare,
  UserPlus,
  CheckCircle,
  X,
  Send,
  Loader2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import api from '../../services/api';
import { toastSuccess, toastError } from '../../utils/toast';

interface WorkHistory {
  id: string;
  companyName: string;
  logoUrl: string | null;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  location: string | null;
}

interface EducationDetails {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
}

interface AlumniDetails {
  id: string;
  userId: string;
  fullName: string;
  passingYear: number;
  branch: string;
  course: string;
  bio: string | null;
  profileImageUrl: string | null;
  linkedinUrl: string | null;
  location: string | null;
  currentCompany: string | null;
  currentRole: string | null;
  experience: number;
  skills: string[];
  workHistory: WorkHistory[];
  education: EducationDetails[];
  isFollowing: boolean;
  isSaved: boolean;
  connectionState: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED' | 'REJECTED';
  connectionId: string | null;
  mentorshipAvailability: 'AVAILABLE' | 'BUSY';
  achievements: string[];
}

interface AlumniProfileViewProps {
  alumniId: string;
  onGoBack: () => void;
}

export default function AlumniProfileView({ alumniId, onGoBack }: AlumniProfileViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'about' | 'history' | 'mentorship'>('about');

  // Message modal state
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Fetch Alumni Details
  const { data: alumni, isLoading, error } = useQuery<AlumniDetails>({
    queryKey: ['alumniDetails', alumniId],
    queryFn: async () => {
      const res = await api.get(`/alumni/${alumniId}`);
      return res.data.data;
    }
  });

  // Mutations
  const connectMutation = useMutation({
    mutationFn: async () => {
      if (!alumni) return;
      const res = await api.post('/alumni/connections/send', { receiverId: alumni.userId });
      return res.data;
    },
    onSuccess: (resData) => {
      toastSuccess(resData.message || 'Connection request sent!');
      queryClient.invalidateQueries({ queryKey: ['alumniDetails', alumniId] });
      queryClient.invalidateQueries({ queryKey: ['alumniList'] });
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to send connection request');
    }
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!alumni || !alumni.connectionId) return;
      const res = await api.patch('/alumni/connections/accept', { connectionId: alumni.connectionId });
      return res.data;
    },
    onSuccess: () => {
      toastSuccess('Connection request accepted!');
      queryClient.invalidateQueries({ queryKey: ['alumniDetails', alumniId] });
      queryClient.invalidateQueries({ queryKey: ['alumniList'] });
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to accept connection request');
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!alumni) return;
      const res = await api.post(`/alumni/${alumni.id}/save`);
      return res.data;
    },
    onSuccess: (resData) => {
      toastSuccess(resData.message || 'Save status updated');
      queryClient.invalidateQueries({ queryKey: ['alumniDetails', alumniId] });
      queryClient.invalidateQueries({ queryKey: ['alumniList'] });
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update save status');
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumni || !messageContent.trim()) return;

    setIsSendingMessage(true);
    try {
      await api.post('/alumni/messages', {
        receiverId: alumni.userId,
        content: messageContent.trim()
      });
      toastSuccess(`Message sent to ${alumni.fullName}!`);
      setMessageContent('');
      setIsMessageOpen(false);
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-slate-400 text-xs font-semibold">Opening profile timeline...</p>
      </div>
    );
  }

  if (error || !alumni) {
    return (
      <div className="text-center py-16 border border-slate-900 rounded-3xl bg-slate-950/20">
        <ArrowLeft className="h-8 w-8 text-slate-500 mx-auto mb-3 cursor-pointer" onClick={onGoBack} />
        <h3 className="text-sm font-bold text-white">Failed to load alumni profile</h3>
        <button onClick={onGoBack} className="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-350 hover:text-white cursor-pointer">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <button 
        onClick={onGoBack}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-300 cursor-pointer animate-fade-in"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to listings
      </button>

      {/* Main Profile Header Hero banner */}
      <div className="relative rounded-3xl border border-slate-900 bg-slate-950/40 overflow-hidden shadow-xl">
        
        {/* Cover Banner Mockup */}
        <div className="h-44 bg-gradient-to-r from-blue-900/50 via-slate-900/80 to-indigo-900/40 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        </div>

        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 relative">
          
          <div className="flex flex-col md:flex-row md:items-end gap-5">
            {/* Avatar Photo */}
            <div className="h-28 w-28 rounded-2xl overflow-hidden border-4 border-slate-950 bg-slate-900 shadow-xl shrink-0">
              {alumni.profileImageUrl ? (
                <img src={alumni.profileImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center font-black text-4xl text-white">
                  {alumni.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-1.5 md:pt-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white leading-tight flex items-center gap-1.5">
                  {alumni.fullName}
                  <CheckCircle className="h-5 w-5 text-blue-500 fill-blue-500/10" />
                </h1>
                
                {alumni.mentorshipAvailability === 'AVAILABLE' ? (
                  <span className="bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0">
                    Mentoring
                  </span>
                ) : (
                  <span className="bg-slate-900 text-slate-500 border border-slate-850 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0">
                    Mentorship Busy
                  </span>
                )}
              </div>

              <p className="text-sm font-bold text-slate-300">
                {alumni.currentRole || 'Alumni Member'} {alumni.currentCompany ? `at ${alumni.currentCompany}` : ''}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-400 font-medium">
                <span className="text-slate-350">
                  {alumni.course} {alumni.branch} • Class of {alumni.passingYear}
                </span>
                {alumni.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" /> {alumni.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-slate-500" /> {alumni.experience} Years Experience
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            {alumni.connectionState === 'CONNECTED' ? (
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-400 cursor-default">
                ✓ Connected
              </button>
            ) : alumni.connectionState === 'PENDING_SENT' ? (
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-slate-900 border border-slate-900 rounded-xl text-xs font-bold text-amber-500/80 cursor-default">
                Request Sent
              </button>
            ) : alumni.connectionState === 'PENDING_RECEIVED' ? (
              <button 
                onClick={() => acceptMutation.mutate()}
                className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Accept Connection
              </button>
            ) : (
              <button 
                onClick={() => connectMutation.mutate()}
                className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus className="h-4 w-4" /> Connect
              </button>
            )}

            <button 
              onClick={() => setIsMessageOpen(true)}
              className="px-4 py-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-350 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <MessageSquare className="h-4 w-4" /> Message
            </button>

            <button 
              onClick={() => saveMutation.mutate()}
              className={`p-2.5 rounded-xl border transition-all ${
                alumni.isSaved 
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' 
                  : 'border-slate-850 bg-slate-900/40 text-slate-450 hover:text-white'
              }`}
            >
              <Award className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-900 pb-px">
        {[
          { id: 'about', label: 'Profile Info' },
          { id: 'history', label: 'Experience & Education' },
          { id: 'mentorship', label: 'Mentorship Availability' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all relative ${
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-400 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
        
        {/* Left Column: tab content detail */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Bio block */}
              <div className="p-6 rounded-3xl border border-slate-900 bg-slate-950/20 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Biography</h2>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {alumni.bio || "No summary provided by this alumnus yet. Connecting or messaging is the best way to get guidance and advice."}
                </p>
              </div>

              {/* Achievements */}
              <div className="p-6 rounded-3xl border border-slate-900 bg-slate-950/20 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Achievements & Recognitions</h2>
                <ul className="space-y-3">
                  {alumni.achievements.map((ach, idx) => (
                    <li key={idx} className="flex items-start gap-3.5 text-sm text-slate-350">
                      <Award className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 animate-fade-in">
              {/* Work experience timeline */}
              <div className="p-6 rounded-3xl border border-slate-900 bg-slate-950/20 space-y-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-400" /> Work History
                </h2>

                {alumni.workHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">No work history logged.</p>
                ) : (
                  <div className="relative border-l border-slate-900 ml-4 pl-6 space-y-6">
                    {alumni.workHistory.map((work) => (
                      <div key={work.id} className="relative">
                        {/* Timeline Node dot */}
                        <div className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full bg-slate-950 border-2 border-blue-500 flex items-center justify-center shrink-0">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-extrabold text-white text-base leading-snug">{work.role}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
                            <span className="text-slate-200">{work.companyName}</span>
                            {work.location && <span>• {work.location}</span>}
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-600" />
                            {new Date(work.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - {
                              work.endDate 
                                ? new Date(work.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) 
                                : 'Present'
                            }
                          </p>
                          {work.description && (
                            <p className="text-xs text-slate-450 leading-relaxed mt-2.5 whitespace-pre-wrap">{work.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education list */}
              <div className="p-6 rounded-3xl border border-slate-900 bg-slate-950/20 space-y-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2 flex items-center gap-2">
                  <GraduationCap className="h-4.5 w-4.5 text-blue-400" /> Education History
                </h2>

                {alumni.education.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">No educational history logged.</p>
                ) : (
                  <div className="relative border-l border-slate-900 ml-4 pl-6 space-y-6">
                    {alumni.education.map((edu) => (
                      <div key={edu.id} className="relative">
                        <div className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center shrink-0">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-extrabold text-white text-base leading-snug">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h4>
                          <p className="text-xs font-bold text-slate-305">{edu.institution}</p>
                          <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-600" />
                            {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'mentorship' && (
            <div className="p-6 rounded-3xl border border-slate-900 bg-slate-950/20 space-y-5 animate-fade-in">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-blue-400" /> Mentorship Guidelines
              </h2>
              
              <div className="p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl text-xs text-slate-350 space-y-3 leading-relaxed">
                <p className="font-bold text-white">How this works:</p>
                <p>1. Connect with the alumni member by clicking the "Connect" button above.</p>
                <p>2. Once your request is accepted, click "Message" to pitch your mentorship query (career goals, mock interviews, resume guidance).</p>
                <p>3. Be professional, direct, and respectful of their professional schedules.</p>
              </div>

              <div className="flex gap-4 items-center flex-wrap pt-2">
                <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Mentorship Status</span>
                  <p className="text-sm font-bold text-emerald-450 uppercase">{alumni.mentorshipAvailability}</p>
                </div>
                <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Avg Response Time</span>
                  <p className="text-sm font-bold text-white">~ 2 Days</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Skills checklist & social connections */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Skills checklist */}
          <div className="p-5 rounded-3xl border border-slate-900 bg-slate-950/40 space-y-4 shadow-md">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Expertise & Skills</h3>
            <div className="flex flex-wrap gap-2">
              {alumni.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-350">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Social Profiles */}
          <div className="p-5 rounded-3xl border border-slate-900 bg-slate-950/40 space-y-4 shadow-md text-xs">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Social Links</h3>
            
            <div className="space-y-3">
              {alumni.linkedinUrl && (
                <a 
                  href={alumni.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/20 border border-slate-900 hover:border-blue-500/20 transition-all font-semibold text-slate-300"
                >
                  <FaLinkedin className="h-4.5 w-4.5 text-blue-400" />
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-slate-500" />
                </a>
              )}
              
              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); toastSuccess('Portfolio page link coming soon!'); }}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/20 border border-slate-900 hover:border-slate-800 transition-all font-semibold text-slate-300"
              >
                <Globe className="h-4.5 w-4.5 text-slate-500" />
                <span>Alumni Portfolio</span>
                <ExternalLink className="h-3 w-3 ml-auto text-slate-550" />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* SEND MESSAGE MODAL */}
      {isMessageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsMessageOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-2xl border border-slate-850 bg-slate-950 p-6 shadow-2xl text-slate-200 z-10 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">Send Message</h3>
                <p className="text-[10px] text-slate-400">To: {alumni.fullName}</p>
              </div>
              <button 
                onClick={() => setIsMessageOpen(false)}
                className="w-7 h-7 rounded-lg border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ask a question or request guidance..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed placeholder-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                <button 
                  type="button" 
                  onClick={() => setIsMessageOpen(false)}
                  className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSendingMessage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-colors"
                >
                  {isSendingMessage ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
