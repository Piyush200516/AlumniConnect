import { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  FileText, 
  Check, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  Info,
  Award
} from 'lucide-react';
import api from '../../services/api';
import { toastSuccess, toastError } from '../../utils/toast';
import { useAuthContext } from '../../components/layout/AuthProvider';

interface Event {
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  category: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  eventDate: string;
  eventTime: string;
  venue: string;
  totalSeats: number;
  availableSeats: number;
  registrationDeadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  speakerName: string;
  speakerDesignation: string | null;
  speakerCompany: string | null;
  registrations?: any[];
}

interface Registration {
  id: string;
  registrationId: string;
  eventId: string;
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW';
  event: Event;
}

interface Certificate {
  id: string;
  registrationId: string;
  certificateUrl: string;
  issuedAt: string;
  event: Event;
}

interface EventsPageProps {
  onSelectEvent: (eventId: string) => void;
  onViewCertificate: (certId: string) => void;
}

export default function EventsPage({ onSelectEvent, onViewCertificate }: EventsPageProps) {
  const { profile } = useAuthContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'registered' | 'past' | 'certificates'>('all');

  // Cancel registration state
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedCategory, selectedMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'certificates') {
        const certRes = await api.get('/events/my-certificates');
        setCertificates(certRes.data.data || []);
      } else {
        // Fetch events
        const eventRes = await api.get('/events', {
          params: {
            search: searchTerm || undefined,
            category: selectedCategory === 'ALL' ? undefined : selectedCategory,
            mode: selectedMode === 'ALL' ? undefined : selectedMode,
            tab: activeTab === 'registered' ? undefined : activeTab // registered handled locally or via service
          }
        });
        
        let fetchedEvents = eventRes.data.data || [];
        
        // If "registered" tab, we filter events that have active student registrations
        if (activeTab === 'registered') {
          const regRes = await api.get('/events/my-registrations');
          const myRegs = regRes.data.data || [];
          setRegistrations(myRegs);
          
          // Filter live registrations
          const activeRegEventIds = myRegs
            .filter((r: any) => r.status === 'REGISTERED' || r.status === 'ATTENDED')
            .map((r: any) => r.eventId);
          
          fetchedEvents = fetchedEvents.filter((e: Event) => activeRegEventIds.includes(e.id));
        }

        setEvents(fetchedEvents);
      }

      // Keep My Registrations list updated in sidebar
      if (activeTab !== 'registered') {
        const regRes = await api.get('/events/my-registrations');
        setRegistrations(regRes.data.data || []);
      }
    } catch (err: any) {
      console.error(err);
      toastError('Failed to fetch events data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchData();
    }
  };

  const handleRegister = async (eventId: string) => {
    // Check local student profile requirements first
    const isProfileComplete = !!(profile?.phone && profile?.profileImage);
    const isAppSubmitted = profile?.verificationStatus === 'VERIFIED';
    const isResumeUploaded = !!profile?.resumeUrl;

    if (!isProfileComplete || !isAppSubmitted || !isResumeUploaded) {
      let missingMsg = 'You are not eligible to register. Missing requirements:\n';
      if (!isProfileComplete) missingMsg += '• Complete profile basic details & photo\n';
      if (!isAppSubmitted) missingMsg += '• Approved CDC Portal Application\n';
      if (!isResumeUploaded) missingMsg += '• Uploaded Resume PDF';
      toastError(missingMsg);
      return;
    }

    onSelectEvent(eventId); // Go to detail view which handles registration modal
  };

  const handleCancelRegistration = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to cancel your registration for this event?')) {
      return;
    }

    setCancelLoading(eventId);
    try {
      await api.post(`/events/${eventId}/cancel`);
      toastSuccess('Registration cancelled successfully');
      fetchData();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setCancelLoading(null);
    }
  };

  // Helper formatting dates
  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    return { day, month };
  };

  // List of categories for sidebar widget
  const categoriesList = [
    { name: 'ALL', label: 'All Categories', count: 24 },
    { name: 'Alumni Talk', label: 'Alumni Talks', count: 6 },
    { name: 'Workshop', label: 'Workshops', count: 7 },
    { name: 'Networking Event', label: 'Networking', count: 5 },
    { name: 'Training Program', label: 'Training', count: 4 },
    { name: 'Placement Drive', label: 'Placement Drives', count: 2 },
  ];

  // Active registrations list for sidebar widget (exclude cancelled)
  const activeRegistrations = registrations.filter(r => r.status === 'REGISTERED' || r.status === 'ATTENDED');

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Events</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Discover and register for exciting events organized by CDC and Alumni.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 grid-cols-1 xl:grid-cols-12">
        
        {/* Left Column - Events and Filters */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Filters Bar */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 p-4 rounded-2xl border border-slate-900/80 bg-slate-950/40 backdrop-blur-xl shadow-xl shadow-black/10">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search events by title or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Modes</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <button 
              onClick={fetchData}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 cursor-pointer transition-colors"
            >
              Search
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-900/80 gap-6 text-sm font-semibold text-slate-400">
            {(['all', 'upcoming', 'registered', 'past', 'certificates'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 border-b-2 capitalize cursor-pointer transition-colors ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-400 font-bold' 
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                {tab === 'all' ? 'All Events' : tab === 'registered' ? 'Registered' : tab === 'past' ? 'Past Events' : tab}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex h-[40vh] flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-slate-400 text-xs font-semibold">Loading Events Feed...</p>
            </div>
          ) : activeTab === 'certificates' ? (
            /* Certificates list */
            certificates.length === 0 ? (
              <div className="text-center p-16 border border-dashed border-slate-900 rounded-3xl">
                <Award className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">No certificates earned yet</h3>
                <p className="text-slate-500 text-xs mt-1">Attend events to automatically earn digital certificates.</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {certificates.map((cert) => (
                  <div key={cert.id} className="p-5 rounded-2xl border border-slate-900 bg-slate-950/30 flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Verified</span>
                        <Award className="h-4.5 w-4.5 text-amber-500" />
                      </div>
                      <h4 className="text-sm font-bold text-white mt-2 leading-snug">{cert.event.title}</h4>
                      <p className="text-[11px] text-slate-500">Issued: {new Date(cert.issuedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <button 
                      onClick={() => onViewCertificate(cert.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-blue-400 hover:text-white transition-all cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View Certificate
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : events.length === 0 ? (
            <div className="text-center p-16 border border-dashed border-slate-900 rounded-3xl">
              <AlertCircle className="h-10 w-10 text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No events found</h3>
              <p className="text-slate-500 text-xs mt-1">Check back later or change filter keywords.</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {events.map((event) => {
                const { day, month } = formatEventDate(event.eventDate);
                const isUserRegistered = event.registrations && event.registrations.length > 0 && event.registrations[0].status === 'REGISTERED';
                const isUserAttended = event.registrations && event.registrations.length > 0 && event.registrations[0].status === 'ATTENDED';

                return (
                  <div key={event.id} className="rounded-2xl border border-slate-900 bg-slate-950/20 hover:border-slate-800/80 shadow-lg overflow-hidden transition-all duration-300 flex flex-col group">
                    {/* Event Banner */}
                    <div className="h-48 bg-slate-900 border-b border-slate-900/60 relative overflow-hidden shrink-0">
                      {event.bannerUrl ? (
                        <img 
                          src={event.bannerUrl} 
                          alt="" 
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-blue-950/20 to-indigo-950/30">
                          <CalendarIcon className="h-12 w-12 text-slate-800" />
                        </div>
                      )}
                      <span className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-lg shadow-blue-600/10">
                        {event.mode}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex gap-4">
                      {/* Date Badge */}
                      <div className="flex flex-col items-center justify-center bg-slate-900/85 border border-slate-850 h-14 w-12 rounded-xl shrink-0">
                        <span className="text-lg font-extrabold text-white leading-none">{day}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{month}</span>
                      </div>
                      
                      {/* Title & Info */}
                      <div className="space-y-3 min-w-0 flex-1">
                        <div>
                          <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider block">{event.category}</span>
                          <h4 className="font-bold text-white text-sm mt-0.5 leading-snug group-hover:text-blue-400 transition-colors truncate">
                            {event.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">By {event.speakerName} ({event.speakerCompany})</p>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-400 font-semibold">
                          <p className="flex items-center gap-1.5 truncate">
                            <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            {event.venue}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            {event.eventTime}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-emerald-400 font-bold">
                            {event.availableSeats} Seats Left
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Deadline: {new Date(event.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 pb-5 pt-1 grid grid-cols-2 gap-3 shrink-0">
                      <button 
                        onClick={() => onSelectEvent(event.id)}
                        className="w-full py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        View Details
                      </button>
                      
                      {isUserAttended ? (
                        <span className="w-full flex items-center justify-center gap-1 py-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs font-bold text-emerald-400 select-none">
                          <Check className="h-3.5 w-3.5" /> Attended
                        </span>
                      ) : isUserRegistered ? (
                        <button 
                          disabled={cancelLoading === event.id}
                          onClick={() => handleCancelRegistration(event.id)}
                          className="w-full py-2 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900 hover:border-rose-800 rounded-xl text-xs font-bold text-rose-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          {cancelLoading === event.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Cancel Reg'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleRegister(event.id)}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white shadow-md shadow-blue-500/15 cursor-pointer transition-colors"
                        >
                          Register Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Sidebar Column */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Event Categories Widget */}
          <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-6 backdrop-blur-xl space-y-4 shadow-xl shadow-black/10">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">Event Categories</h3>
            <div className="space-y-1.5">
              {categoriesList.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    selectedCategory === cat.name
                      ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400'
                      : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedCategory === cat.name
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-slate-900 text-slate-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* My Registrations Widget */}
          <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-6 backdrop-blur-xl space-y-4 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">My Registrations</h3>
              <button 
                onClick={() => setActiveTab('registered')}
                className="text-[11px] font-bold text-blue-400 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>
            
            {activeRegistrations.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No active registrations.</p>
            ) : (
              <div className="space-y-3">
                {activeRegistrations.slice(0, 3).map((reg) => (
                  <div key={reg.id} className="flex items-center gap-3 p-2 bg-slate-900/30 border border-slate-900 rounded-xl">
                    <div className="h-9 w-9 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                      {reg.event.bannerUrl ? (
                        <img src={reg.event.bannerUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs font-bold text-slate-700">E</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-white truncate leading-snug">{reg.event.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(reg.event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <button 
                      onClick={() => onSelectEvent(reg.eventId)}
                      className="w-7 h-7 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 flex items-center justify-center text-blue-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guidelines Widget */}
          <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-6 backdrop-blur-xl space-y-4 shadow-xl shadow-black/10">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <Info className="h-4.5 w-4.5 text-blue-400" /> Event Guidelines
            </h3>
            <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed font-semibold">
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                Register early to secure your seat (Seats are limited).
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                Carry your college ID card or event pass QR code for verification.
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                Be on time and maintain proper auditorium decorum.
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                Cancellations are only allowed up to 24 hours prior to the event.
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
