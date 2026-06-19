import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Download, 
  Paperclip, 
  Send, 
  Video, 
  Phone as PhoneIcon, 
  X, 
  CheckCircle, 
  Plus, 
  ExternalLink, 
  Loader2, 
  Sliders,
  Check,
  ChevronRight,
  Mail,
  PhoneCall,
  Settings,
  DollarSign
} from 'lucide-react';
import api from '../../services/api';
import { useAuthContext } from '../../components/layout/AuthProvider';
import { useSocket } from '../../components/layout/SocketProvider';
import { toastSuccess, toastError } from '../../utils/toast';

interface Mentor {
  connectionId: string;
  mentorId: string;
  fullName: string;
  profileImageUrl: string | null;
  passingYear: number;
  branch: string;
  course: string;
  currentCompany: string | null;
  companyLogo: string | null;
  designation: string | null;
  experience: number;
  location: string | null;
  skills: string[];
  mentorshipAvailability: string;
  email: string;
  phone: string | null;
  currentCtc: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
}

interface Mentee {
  connectionId: string;
  menteeId: string;
  fullName: string;
  profileImageUrl: string | null;
  branch: string;
  course: string;
  graduationYear: number;
  skills: string[];
  bio: string | null;
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  resumeUrl: string | null;
}

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  isSystem: boolean;
  isResumeReview: boolean;
  isRead: boolean;
  createdAt: string;
  attachments: Array<{
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }>;
}

export default function Mentorship() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { socket, isOnline } = useSocket();
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'my-mentors' | 'requests' | 'explore-mentors'>('overview');
  
  // Role checks
  const isAlumni = user?.role === 'alumni';
  
  // Chat States
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<any | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Settings/Privacy State
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [privacySetting, setPrivacySetting] = useState<'PUBLIC' | 'CONNECTIONS_ONLY' | 'HIDDEN'>('PUBLIC');
  const [phoneVal, setPhoneVal] = useState('');
  const [portfolioVal, setPortfolioVal] = useState('');
  const [ctcVal, setCtcVal] = useState('');

  // Request Mentorship State
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestTargetId, setRequestTargetId] = useState<string | null>(null);
  const [requestTargetName, setRequestTargetName] = useState('');
  const [requestMsg, setRequestMsg] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  // Meeting Schedule State
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingDuration, setMeetingDuration] = useState(30);

  // Resource Share State
  const [isResourceOpen, setIsResourceOpen] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDesc, setResourceDesc] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [resourceFileUrl, setResourceFileUrl] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Dashboard Stats & Meetings
  const { data: dashboardData } = useQuery({
    queryKey: ['mentorshipDashboard'],
    queryFn: async () => {
      const res = await api.get('/mentorship/dashboard');
      return res.data.data;
    }
  });

  // Fetch My Mentors (Student)
  const { data: myMentors = [], isLoading: isMentorsLoading } = useQuery<Mentor[]>({
    queryKey: ['myMentors'],
    queryFn: async () => {
      const res = await api.get('/mentorship/my-mentors');
      return res.data.data;
    },
    enabled: !isAlumni
  });

  // Fetch My Mentees (Alumni)
  const { data: myMentees = [], isLoading: isMenteesLoading } = useQuery<Mentee[]>({
    queryKey: ['myMentees'],
    queryFn: async () => {
      const res = await api.get('/mentorship/my-mentees');
      return res.data.data;
    },
    enabled: isAlumni
  });

  // Fetch All Alumni (For directory search in Explore Mentors)
  const { data: exploreMentorsData, isLoading: isExploreLoading } = useQuery({
    queryKey: ['exploreMentorsList'],
    queryFn: async () => {
      const res = await api.get('/alumni');
      return res.data.data;
    },
    enabled: !isAlumni
  });

  const exploreAlumni = exploreMentorsData?.alumni || [];

  // Mutations
  const acceptRequestMutation = useMutation({
    mutationFn: async ({ requestId, note }: { requestId: string; note?: string }) => {
      const res = await api.patch('/mentorship/accept', { requestId, note });
      return res.data;
    },
    onSuccess: () => {
      toastSuccess('Mentorship request accepted!');
      queryClient.invalidateQueries({ queryKey: ['mentorshipDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['myMentees'] });
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to accept request');
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, note }: { requestId: string; note?: string }) => {
      const res = await api.patch('/mentorship/reject', { requestId, note });
      return res.data;
    },
    onSuccess: () => {
      toastSuccess('Mentorship request declined');
      queryClient.invalidateQueries({ queryKey: ['mentorshipDashboard'] });
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to decline request');
    }
  });

  // Load Privacy settings on open
  useEffect(() => {
    if (isAlumni && dashboardData) {
      // Find or pull settings if available
    }
  }, [dashboardData, isAlumni]);

  // Handle active conversation message retrieval
  useEffect(() => {
    if (!activeConnectionId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${activeConnectionId}`);
        setChatMessages(res.data.data);
      } catch (err) {
        console.error('Failed to load chat messages:', err);
      }
    };

    fetchMessages();

    // Socket.io - Join Room
    if (socket) {
      socket.emit('join_room', activeConnectionId);

      socket.on('receive_message', (msg: ChatMessage) => {
        setChatMessages(prev => {
          if (prev.find(p => p.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });

      socket.on('typing_start', ({ roomId }: { roomId: string }) => {
        if (roomId === activeConnectionId) {
          setPartnerTyping(true);
        }
      });

      socket.on('typing_stop', ({ roomId }: { roomId: string }) => {
        if (roomId === activeConnectionId) {
          setPartnerTyping(false);
        }
      });
    }

    return () => {
      if (socket && activeConnectionId) {
        socket.emit('leave_room', activeConnectionId);
        socket.off('receive_message');
        socket.off('typing_start');
        socket.off('typing_stop');
      }
    };
  }, [activeConnectionId, socket]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConnectionId || (!messageText.trim())) return;

    const text = messageText.trim();
    setMessageText('');

    // Trigger typing stop
    if (socket) {
      socket.emit('typing_stop', { roomId: activeConnectionId, userId: (user as any)?.id });
      setIsTyping(false);
    }

    try {
      await api.post('/messages/send', {
        connectionId: activeConnectionId,
        content: text
      });
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    if (!socket || !activeConnectionId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', { roomId: activeConnectionId, userId: (user as any)?.id });
    }

    // Debounce typing stop after 2s
    const lastTypingTime = new Date().getTime();
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const difference = timeNow - lastTypingTime;
      if (difference >= 2000 && isTyping) {
        socket.emit('typing_stop', { roomId: activeConnectionId, userId: (user as any)?.id });
        setIsTyping(false);
      }
    }, 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConnectionId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const filePayload = uploadRes.data.data;
      
      // Dispatch uploaded attachment message
      await api.post('/messages/send', {
        connectionId: activeConnectionId,
        content: `Shared file: ${filePayload.fileName}`,
        attachments: [{
          fileUrl: filePayload.fileUrl,
          fileName: filePayload.fileName,
          fileType: filePayload.fileType,
          fileSize: filePayload.fileSize
        }]
      });
      
      toastSuccess('File uploaded and shared successfully');
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRequestResumeReview = async () => {
    if (!activeConnectionId) return;
    try {
      await api.post('/messages/send', {
        connectionId: activeConnectionId,
        content: '📄 Requested a Resume Review. Please review my profile and shared documents.',
        isResumeReview: true
      });
      toastSuccess('Resume review request submitted!');
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to request resume review');
    }
  };

  const handleRequestMentorshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTargetId) return;
    setIsSubmittingReq(true);
    try {
      await api.post('/mentorship/request', {
        alumniId: requestTargetId,
        message: requestMsg
      });
      toastSuccess('Mentorship request sent successfully!');
      setIsRequestOpen(false);
      setRequestMsg('');
      queryClient.invalidateQueries({ queryKey: ['mentorshipDashboard'] });
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to send mentorship request');
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const handleScheduleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConnectionId) return;
    try {
      await api.post('/mentorship/meetings', {
        connectionId: activeConnectionId,
        title: meetingTitle,
        scheduledAt: meetingDate,
        duration: Number(meetingDuration),
        meetingLink: meetingLink
      });
      toastSuccess('Meeting scheduled!');
      setIsMeetingOpen(false);
      setMeetingTitle('');
      setMeetingDate('');
      setMeetingLink('');
      queryClient.invalidateQueries({ queryKey: ['mentorshipDashboard'] });
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to schedule meeting');
    }
  };

  const handleShareResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConnectionId) return;
    try {
      await api.post('/mentorship/resources', {
        connectionId: activeConnectionId,
        title: resourceTitle,
        description: resourceDesc,
        linkUrl: resourceLink,
        fileUrl: resourceFileUrl
      });
      toastSuccess('Resource shared successfully!');
      setIsResourceOpen(false);
      setResourceTitle('');
      setResourceDesc('');
      setResourceLink('');
      setResourceFileUrl('');
      queryClient.invalidateQueries({ queryKey: ['mentorshipDashboard'] });
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to share resource');
    }
  };

  const handleSavePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/mentorship/alumni-privacy', {
        privacySetting,
        phone: phoneVal || null,
        portfolioUrl: portfolioVal || null,
        currentCtc: ctcVal || null
      });
      toastSuccess('Privacy settings updated');
      setIsPrivacyOpen(false);
      queryClient.invalidateQueries({ queryKey: ['mentorshipDashboard'] });
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update settings');
    }
  };

  const triggerChat = (partner: any, connId: string) => {
    setActiveConnectionId(connId);
    setActivePartner(partner);
  };

  // Memoized stats calculation
  const stats = useMemo(() => {
    if (!dashboardData?.stats) {
      return { activeMentors: 0, pendingRequests: 0, conversations: 0, resourcesShared: 0, totalMentees: 0, activeConversations: 0 };
    }
    return dashboardData.stats;
  }, [dashboardData]);

  return (
    <div className="grid gap-8 grid-cols-1 xl:grid-cols-12 items-start text-slate-200">
      
      {/* LEFT AREA: Dashboards, Lists, Filters */}
      <div className="xl:col-span-8 space-y-6">
        
        {/* Module Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white leading-none">Mentorship</h1>
            <p className="text-xs text-slate-400">Connect with alumni mentors and grow your career</p>
          </div>
          {isAlumni && (
            <button 
              onClick={() => setIsPrivacyOpen(true)}
              className="px-4 py-2 border border-slate-800 bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Settings className="w-4 h-4" /> Privacy Settings
            </button>
          )}
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-900 pb-px">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'my-mentors', label: isAlumni ? 'My Mentees' : 'My Mentors' },
            ...(!isAlumni ? [{ id: 'explore-mentors', label: 'Explore Mentors' }] : []),
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all relative ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-400 font-extrabold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Panels */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Stats Widgets */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              <div className="p-4 rounded-2xl border border-slate-900 bg-slate-950/20 shadow-md flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-emerald-450" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider leading-none">Active Mentors</p>
                  <p className="text-xl font-black text-white mt-1">{isAlumni ? stats.totalMentees : stats.activeMentors}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-900 bg-slate-950/20 shadow-md flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5 text-purple-450" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider leading-none">Pending Requests</p>
                  <p className="text-xl font-black text-white mt-1">{stats.pendingRequests}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-900 bg-slate-950/20 shadow-md flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-blue-450" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider leading-none">Conversations</p>
                  <p className="text-xl font-black text-white mt-1">{isAlumni ? stats.activeConversations : stats.conversations}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-900 bg-slate-950/20 shadow-md flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-amber-450" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider leading-none">Files & Resources</p>
                  <p className="text-xl font-black text-white mt-1">{stats.resourcesShared}</p>
                </div>
              </div>
            </div>

            {/* Pending Invite Moderation List (Only if Alumni) */}
            {isAlumni && dashboardData?.requestsList && dashboardData.requestsList.length > 0 && (
              <div className="p-6 rounded-3xl border border-slate-900 bg-slate-950/20 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Pending Connection Requests</h3>
                
                <div className="space-y-4">
                  {dashboardData.requestsList.map((req: any) => (
                    <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-900 rounded-2xl bg-slate-950/40 hover:border-slate-850 transition-all">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                          {req.studentImageUrl ? (
                            <img src={req.studentImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
                              {req.studentName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-sm flex items-center gap-1">
                            {req.studentName}
                            <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                          </h4>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            {req.studentCourse} {req.studentBranch} • Graduating Class {req.studentYear}
                          </p>
                          {req.message && (
                            <p className="text-xs text-slate-450 italic mt-2 border-l border-slate-850 pl-3">"{req.message}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 self-end sm:self-center">
                        <button 
                          onClick={() => acceptRequestMutation.mutate({ requestId: req.id })}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => rejectRequestMutation.mutate({ requestId: req.id })}
                          className="px-4 py-2 border border-slate-850 hover:bg-rose-950/20 hover:text-rose-400 text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming meetings section widget */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <div className="p-6 rounded-3xl border border-slate-900 bg-slate-950/20 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Upcoming Meetings</h3>
                {dashboardData?.upcomingMeetings && dashboardData.upcomingMeetings.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.upcomingMeetings.map((meet: any) => (
                      <div key={meet.id} className="p-3 border border-slate-900 bg-slate-950/40 rounded-xl space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-white text-xs leading-tight">{meet.title}</h4>
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                            {meet.duration} Min
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {new Date(meet.scheduledAt).toLocaleString()} with <span className="text-slate-200 font-bold">{meet.partnerName}</span>
                        </p>
                        {meet.meetingLink && (
                          <a 
                            href={meet.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors pt-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Join Session Link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-4">No meetings scheduled.</p>
                )}
              </div>

              {/* Shared learning materials widget */}
              <div className="p-6 rounded-3xl border border-slate-900 bg-slate-950/20 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Shared Resources</h3>
                {dashboardData?.sharedResources && dashboardData.sharedResources.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.sharedResources.map((res: any) => (
                      <div key={res.id} className="p-3 border border-slate-900 bg-slate-950/40 rounded-xl flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-white text-xs truncate leading-tight">{res.title}</h4>
                          <p className="text-[9px] text-slate-500 mt-1 truncate">{res.description || 'No description'}</p>
                        </div>
                        <div className="shrink-0 flex gap-1.5">
                          {res.fileUrl && (
                            <a 
                              href={res.fileUrl} 
                              download
                              className="p-1.5 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {res.linkUrl && (
                            <a 
                              href={res.linkUrl} 
                              target="_blank"
                              rel="noreferrer" 
                              className="p-1.5 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-4">No shared resources yet.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* My Connected Mentors/Mentees Panel */}
        {activeTab === 'my-mentors' && (
          <div className="space-y-4">
            
            {isAlumni ? (
              // Alumni displays Mentees
              isMenteesLoading ? (
                <div className="flex h-44 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : myMentees.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-8 text-center border border-slate-900 rounded-2xl">No mentees connected yet.</p>
              ) : (
                <div className="space-y-4">
                  {myMentees.map((mentee) => (
                    <div key={mentee.menteeId} className="p-5 rounded-3xl border border-slate-900 bg-slate-950/20 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 hover:border-slate-850 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                          {mentee.profileImageUrl ? (
                            <img src={mentee.profileImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-white text-xl">
                              {mentee.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-white text-base leading-tight">{mentee.fullName}</h3>
                            <CheckCircle className="w-4.5 h-4.5 text-blue-500 fill-blue-500/10" />
                          </div>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">
                            {mentee.course} {mentee.branch} • Batch of {mentee.graduationYear}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {mentee.skills.map((skill, index) => (
                              <span key={index} className="px-2 py-0.5 bg-slate-900 border border-slate-850 rounded text-[9px] text-slate-400 font-bold">{skill}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0 self-end sm:self-center">
                        <button 
                          onClick={() => triggerChat(mentee, mentee.connectionId)}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Student displays Mentors
              isMentorsLoading ? (
                <div className="flex h-44 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : myMentors.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-8 text-center border border-slate-900 rounded-2xl">No mentors connected yet. Go to "Explore Mentors" to connect.</p>
              ) : (
                <div className="space-y-4">
                  {myMentors.map((mentor) => (
                    <div key={mentor.mentorId} className="p-5 rounded-3xl border border-slate-900 bg-slate-950/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:border-slate-850 transition-all">
                      
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0 mt-0.5">
                          {mentor.profileImageUrl ? (
                            <img src={mentor.profileImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center font-bold text-white text-xl">
                              {mentor.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-white text-base leading-tight">{mentor.fullName}</h3>
                            <CheckCircle className="w-4.5 h-4.5 text-blue-500 fill-blue-500/10" />
                          </div>
                          
                          <p className="text-xs text-slate-400 font-semibold">
                            {mentor.course} {mentor.branch} • Class of {mentor.passingYear}
                          </p>
                          <p className="text-xs text-slate-300 font-bold flex items-center gap-1">
                            {mentor.designation} at <span className="text-slate-100 font-extrabold">{mentor.currentCompany}</span>
                          </p>

                          <div className="grid gap-2 grid-cols-2 pt-2 text-[10px] text-slate-400 font-semibold border-t border-slate-900/60 mt-1">
                            {mentor.email && <span className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {mentor.email}</span>}
                            {mentor.phone && <span className="flex items-center gap-1.5 truncate"><PhoneCall className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {mentor.phone}</span>}
                            {mentor.currentCtc && <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" /> CTC: {mentor.currentCtc}</span>}
                            {mentor.location && <span className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {mentor.location}</span>}
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {mentor.skills.map((skill, index) => (
                              <span key={index} className="px-2 py-0.5 bg-slate-900 border border-slate-850 rounded text-[9px] text-slate-400 font-bold">{skill}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-2 shrink-0 self-end md:self-center">
                        <button 
                          onClick={() => triggerChat(mentor, mentor.connectionId)}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                        >
                          Message
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )
            )}

          </div>
        )}

        {/* Explore Mentors Panel (Students browse available alumni) */}
        {activeTab === 'explore-mentors' && (
          <div className="space-y-4">
            {isExploreLoading ? (
              <div className="flex h-44 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : exploreAlumni.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-8 text-center border border-slate-900 rounded-2xl">No alumni found in directory.</p>
            ) : (
              <div className="space-y-4">
                {exploreAlumni.map((alumni: any) => (
                  <div key={alumni.id} className="p-5 rounded-3xl border border-slate-900 bg-slate-950/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:border-slate-850 transition-all">
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                        {alumni.profileImageUrl ? (
                          <img src={alumni.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg">
                            {alumni.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                          {alumni.fullName}
                          <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                        </h4>
                        <p className="text-xs text-slate-400 font-semibold">
                          {alumni.course} {alumni.branch} • Graduated {alumni.passingYear}
                        </p>
                        <p className="text-xs text-slate-300 font-bold mt-1">
                          {alumni.designation} at <span className="text-slate-100 font-extrabold">{alumni.currentCompany}</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {alumni.skills.map((skill: string, index: number) => (
                            <span key={index} className="px-2 py-0.5 bg-slate-900 border border-slate-850 rounded text-[9px] text-slate-400 font-bold">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setRequestTargetId(alumni.userId);
                        setRequestTargetName(alumni.fullName);
                        setIsRequestOpen(true);
                      }}
                      className="px-4 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-end md:self-center"
                    >
                      <Plus className="w-3.5 h-3.5" /> Request Mentorship
                    </button>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* RIGHT CHAT AREA: Real-time Messages conversation panel */}
      <div className="xl:col-span-4 h-[75vh] flex flex-col border border-slate-900 bg-slate-950/40 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {activeConnectionId && activePartner ? (
          <>
            {/* Chat Pane Header */}
            <div className="p-4 border-b border-slate-900 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden border border-slate-850 shrink-0 relative">
                  {activePartner.profileImageUrl ? (
                    <img src={activePartner.profileImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-white">
                      {activePartner.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isOnline(activePartner.mentorId || activePartner.menteeId) && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-white text-xs leading-snug flex items-center gap-1 truncate">
                    {activePartner.fullName}
                    <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 shrink-0" />
                  </h3>
                  <p className="text-[9px] text-slate-500 mt-0.5 truncate font-medium">
                    {isOnline(activePartner.mentorId || activePartner.menteeId) ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-2 border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                  <PhoneIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveConnectionId(null)}
                  className="p-2 border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable messages box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/10">
              {chatMessages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-slate-600 text-xs italic">
                  Say Hello to begin your mentorship conversation!
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderId === (user as any)?.id;
                  
                  if (msg.isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">
                        <div className="px-3.5 py-1.5 border border-slate-900 bg-slate-950/60 rounded-xl max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-sm">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed space-y-1.5 shadow-md ${
                        isMe 
                          ? 'bg-blue-650 border border-blue-600 text-white rounded-br-none' 
                          : 'bg-slate-900 border border-slate-850 text-slate-100 rounded-bl-none'
                      }`}>
                        <p>{msg.content}</p>
                        
                        {/* Attachments rendering inside bubble */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-1.5 border-t border-white/10 pt-1.5 mt-1.5">
                            {msg.attachments.map(att => (
                              <div key={att.id} className="flex items-center justify-between gap-3 p-2 bg-black/20 border border-white/5 rounded-xl text-[10px]">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="w-4 h-4 shrink-0 text-slate-400" />
                                  <span className="truncate font-semibold text-slate-200">{att.fileName}</span>
                                </div>
                                <a 
                                  href={att.fileUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="p-1 border border-white/10 hover:bg-white/10 rounded-lg text-white shrink-0"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Date and Checkmarks */}
                        <div className="flex justify-end items-center gap-1 text-[8px] text-white/50 select-none">
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                            msg.isRead ? <CheckCircle className="w-3 h-3 text-emerald-450" /> : <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {partnerTyping && (
                <div className="flex justify-start text-[10px] text-slate-500 italic pl-2">
                  {activePartner.fullName} is typing...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Pane Footer Actions & Input */}
            <div className="p-3 border-t border-slate-900 space-y-2 shrink-0 bg-slate-950/80 backdrop-blur-md">
              
              {/* Mentors meeting/resource share quick controls */}
              <div className="flex justify-between items-center px-1">
                <div className="flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-1.5 border border-slate-900 hover:bg-slate-900 text-slate-450 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                  {!isAlumni && (
                    <button 
                      onClick={handleRequestResumeReview}
                      className="px-2.5 py-1 border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Request Resume Review
                    </button>
                  )}
                </div>
                {isAlumni ? (
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setIsMeetingOpen(true)}
                      className="px-2.5 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/25 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Schedule Call
                    </button>
                    <button 
                      onClick={() => setIsResourceOpen(true)}
                      className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/25 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Share Resource
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setIsResourceOpen(true)}
                      className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/25 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Upload Resource
                    </button>
                  </div>
                )}
              </div>

              {/* Messaging send box */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={handleTyping}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs focus:outline-none focus:border-blue-500/80 leading-relaxed placeholder-slate-700 text-slate-200"
                />
                <button 
                  type="submit" 
                  className="p-2.5 bg-blue-600 hover:bg-blue-550 rounded-xl text-white transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950/20">
            <MessageSquare className="w-10 h-10 text-slate-650" />
            <div>
              <h4 className="font-extrabold text-sm text-slate-400">Mentorship Messages</h4>
              <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto mt-1 leading-relaxed">Select a mentor or mentee from the active connections list to open real-time chat.</p>
            </div>
          </div>
        )}

      </div>

      {/* REQUEST MENTORSHIP DIALOG MODAL */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsRequestOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-3xl border border-slate-900 bg-slate-950 p-6 shadow-2xl text-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Mentorship Request</h3>
                <p className="text-[10px] text-slate-400">To: {requestTargetName}</p>
              </div>
              <button onClick={() => setIsRequestOpen(false)} className="p-1 border border-slate-900 hover:bg-slate-900 text-slate-400 rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleRequestMentorshipSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Introduction / Goal Message</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Introduce yourself and explain what guidance you're seeking (career paths, interview prep, resume help)..."
                  value={requestMsg}
                  onChange={(e) => setRequestMsg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed placeholder-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                <button type="button" onClick={() => setIsRequestOpen(false)} className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmittingReq} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 cursor-pointer">
                  {isSubmittingReq ? 'Submitting...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING DIALOG MODAL */}
      {isMeetingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsMeetingOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-3xl border border-slate-900 bg-slate-950 p-6 shadow-2xl text-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="text-base font-bold text-white">Schedule Video Session</h3>
              <button onClick={() => setIsMeetingOpen(false)} className="p-1 border border-slate-900 hover:bg-slate-900 text-slate-400 rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleScheduleMeetingSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Session Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Portfolio Review & Mock Interview"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Date-Time</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duration (Mins)</label>
                  <select 
                    value={meetingDuration}
                    onChange={(e) => setMeetingDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Meeting Link (Zoom, Meet, Teams)</label>
                <input 
                  type="url" 
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                <button type="button" onClick={() => setIsMeetingOpen(false)} className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 cursor-pointer">Schedule Call</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE RESOURCE DIALOG MODAL */}
      {isResourceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsResourceOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-3xl border border-slate-900 bg-slate-950 p-6 shadow-2xl text-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="text-base font-bold text-white">Share Learning Resource</h3>
              <button onClick={() => setIsResourceOpen(false)} className="p-1 border border-slate-900 hover:bg-slate-900 text-slate-400 rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleShareResourceSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resource Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. System Design Interview prep guide"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brief Description</label>
                <input 
                  type="text" 
                  placeholder="What is this resource about?"
                  value={resourceDesc}
                  onChange={(e) => setResourceDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">External Link (or document URL)</label>
                <input 
                  type="url" 
                  placeholder="https://github.com/..."
                  value={resourceLink}
                  onChange={(e) => setResourceLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                <button type="button" onClick={() => setIsResourceOpen(false)} className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 cursor-pointer">Share</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRIVACY SETTINGS DIALOG MODAL */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsPrivacyOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-3xl border border-slate-900 bg-slate-950 p-6 shadow-2xl text-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="text-base font-bold text-white">Privacy & Details Settings</h3>
              <button onClick={() => setIsPrivacyOpen(false)} className="p-1 border border-slate-900 hover:bg-slate-900 text-slate-400 rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSavePrivacySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Directory Profile Visibility</label>
                <select 
                  value={privacySetting}
                  onChange={(e) => setPrivacySetting(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value="PUBLIC">Public (Everyone can see your profile details)</option>
                  <option value="CONNECTIONS_ONLY">Connections Only (Only direct connections can see email/phone/CTC)</option>
                  <option value="HIDDEN">Hidden (Hidden from Directory exploration)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 99999 88888"
                  value={phoneVal}
                  onChange={(e) => setPhoneVal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Package (CTC)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 28 LPA"
                    value={ctcVal}
                    onChange={(e) => setCtcVal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Portfolio Link</label>
                  <input 
                    type="url" 
                    placeholder="https://myportfolio.dev"
                    value={portfolioVal}
                    onChange={(e) => setPortfolioVal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                <button type="button" onClick={() => setIsPrivacyOpen(false)} className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 cursor-pointer">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
