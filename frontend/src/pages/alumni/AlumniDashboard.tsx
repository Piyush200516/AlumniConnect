import { useState, useEffect } from 'react';
import { 
  Edit, 
  X, 
  Loader2, 
  Users, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  LogOut,
  GraduationCap,
  Sparkles,
  Download,
  Briefcase,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { useAuthContext } from '../../components/layout/AuthProvider';
import api from '../../services/api';
import { toastSuccess, toastError } from '../../utils/toast';

interface Event {
  id: string;
  title: string;
  category: string;
  description: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  eventDate: string;
  eventTime: string;
  duration: string;
  venue: string;
  totalSeats: number;
  availableSeats: number;
  registrationDeadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks: string | null;
  speakerName: string;
  speakerDesignation: string | null;
  speakerCompany: string | null;
  agenda: string | null;
  keyBenefits: string[];
  eligibilityCriteria: string | null;
  requiredDocuments: string[];
}

interface Registrant {
  id: string;
  registrationId: string;
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW';
  createdAt: string;
  user: {
    email: string;
    studentProfile: {
      fullName: string;
      branch: string;
      enrollmentNumber: string;
      phone: string | null;
    } | null;
  };
}

export default function AlumniDashboard() {
  const { profile: authProfile, logout } = useAuthContext();
  const profile = authProfile as any;
  
  // Dashboard view selection
  const [activeTab, setActiveTab] = useState<'events' | 'create' | 'jobs' | 'create_job'>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected event for registrant details / editing
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [registrantsLoading, setRegistrantsLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Attendance scanner input
  const [attendanceCode, setAttendanceCode] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Job opportunities states
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const [jobFormData, setJobFormData] = useState({
    title: '',
    company: profile?.currentCompany || '',
    companyLogo: '',
    location: profile?.location || '',
    salary: '',
    jobType: 'FULL_TIME',
    skillsRequired: '', // comma separated input
    deadline: '',
    description: '',
    responsibilities: '',
    eligibility: '',
    benefits: '',
    selectionProcess: '',
    applicationLink: ''
  });

  const categories = [
    'Alumni Talk',
    'Workshop',
    'Placement Drive',
    'Training Program',
    'Networking Event',
    'Webinar',
    'Seminar',
    'Mock Interview',
    'Resume Building Session',
    'Technical Event',
    'Hackathon',
    'Career Guidance Session'
  ];

  useEffect(() => {
    fetchMyEvents();
    fetchMyJobs();
  }, []);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      // Students see only approved events, but creators should see all events they created
      // So let's fetch from general list, but filter by creator locally or fetch created endpoint
      // Let's create an endpoint in service/routes for events/created
      // Wait, let's call the general API but filter locally since they created it, OR fetch events that they created
      const allEvents = res.data.data || [];
      // Let's filter by createdById
      if (profile) {
        const myCreated = allEvents.filter((e: any) => e.createdById === profile.userId || e.createdById === profile.id);
        setEvents(myCreated);
      }
    } catch (err: any) {
      console.error(err);
      toastError('Failed to fetch created events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        keyBenefits: formData.keyBenefits.split(',').map(b => b.trim()).filter(Boolean),
        requiredDocuments: formData.requiredDocuments.split(',').map(d => d.trim()).filter(Boolean),
        totalSeats: Number(formData.totalSeats)
      };

      await api.post('/events/create', payload);
      toastSuccess('Event created successfully and submitted for CDC approval!');
      
      // Reset form
      setFormData({
        title: '',
        category: 'Alumni Talk',
        description: '',
        mode: 'ONLINE',
        eventDate: '',
        eventTime: '',
        duration: '',
        venue: '',
        googleMapsLocation: '',
        totalSeats: 100,
        registrationDeadline: '',
        agenda: '',
        keyBenefits: '',
        eligibilityCriteria: '',
        requiredDocuments: 'College ID Card',
        speakerName: profile?.fullName || '',
        speakerDesignation: '',
        speakerCompany: '',
        status: 'PUBLISHED'
      });

      setActiveTab('events');
      fetchMyEvents();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setLoading(true);
    try {
      const payload = {
        ...editingEvent,
        totalSeats: Number(editingEvent.totalSeats)
      };
      await api.put(`/events/${editingEvent.id}`, payload);
      toastSuccess('Event updated successfully!');
      setEditingEvent(null);
      fetchMyEvents();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrants = async (event: Event) => {
    setSelectedEvent(event);
    setRegistrantsLoading(true);
    try {
      const res = await api.get(`/events/${event.id}/registrations`);
      setRegistrants(res.data.data || []);
    } catch (err) {
      console.error(err);
      toastError('Failed to fetch event registrants');
    } finally {
      setRegistrantsLoading(false);
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !attendanceCode.trim()) return;

    setAttendanceLoading(true);
    try {
      await api.post(`/events/${selectedEvent.id}/mark-attendance`, {
        registrationId: attendanceCode.trim()
      });
      toastSuccess('Attendance marked successfully! Certificate issued.');
      setAttendanceCode('');
      // Refresh list
      loadRegistrants(selectedEvent);
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleExportRegistrants = () => {
    if (!selectedEvent || registrants.length === 0) return;
    
    // Simple CSV export
    let csv = 'Registration ID,Full Name,Enrollment Number,Email,Phone,Status,Registered At\n';
    registrants.forEach(r => {
      csv += `"${r.registrationId}","${r.user.studentProfile?.fullName || ''}","${r.user.studentProfile?.enrollmentNumber || ''}","${r.user.email}","${r.user.studentProfile?.phone || ''}","${r.status}","${new Date(r.createdAt).toLocaleString()}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Registrations_${selectedEvent.title.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchMyJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await api.get('/jobs');
      setJobs(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      toastError('Failed to fetch posted jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobsLoading(true);
    try {
      const payload = {
        ...jobFormData,
        skillsRequired: jobFormData.skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
        deadline: jobFormData.deadline ? new Date(jobFormData.deadline) : null
      };

      await api.post('/jobs/create', payload);
      toastSuccess('Job posting created successfully and submitted for CDC approval!');
      
      // Reset form
      setJobFormData({
        title: '',
        company: profile?.currentCompany || '',
        companyLogo: '',
        location: profile?.location || '',
        salary: '',
        jobType: 'FULL_TIME',
        skillsRequired: '',
        deadline: '',
        description: '',
        responsibilities: '',
        eligibility: '',
        benefits: '',
        selectionProcess: '',
        applicationLink: ''
      });

      setActiveTab('jobs');
      fetchMyJobs();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create job posting');
    } finally {
      setJobsLoading(false);
    }
  };

  const loadApplicants = async (job: any) => {
    setSelectedJob(job);
    setApplicantsLoading(true);
    try {
      const res = await api.get(`/jobs/${job.id}/applications`);
      setApplicants(res.data.data || []);
    } catch (err) {
      console.error(err);
      toastError('Failed to fetch job applicants');
    } finally {
      setApplicantsLoading(false);
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, status: string) => {
    setUpdatingStatusId(appId);
    try {
      await api.put(`/jobs/applications/${appId}/status`, { status });
      toastSuccess(`Candidate status updated to ${status}`);
      if (selectedJob) {
        loadApplicants(selectedJob);
      }
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to update candidate status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleToggleJobActive = async (jobId: string, currentActive: boolean) => {
    try {
      await api.put(`/jobs/${jobId}`, { isActive: !currentActive });
      toastSuccess(`Job posting ${!currentActive ? 'activated' : 'paused'} successfully!`);
      fetchMyJobs();
    } catch (err: any) {
      console.error(err);
      toastError('Failed to toggle job status');
    }
  };

  // Re-declared form state for event validation
  const [formData, setFormData] = useState({
    title: '',
    category: 'Alumni Talk',
    description: '',
    mode: 'ONLINE',
    eventDate: '',
    eventTime: '',
    duration: '',
    venue: '',
    googleMapsLocation: '',
    totalSeats: 100,
    registrationDeadline: '',
    agenda: '',
    keyBenefits: '', // comma separated input
    eligibilityCriteria: '',
    requiredDocuments: 'College ID Card', // comma separated input
    speakerName: profile?.fullName || '',
    speakerDesignation: '',
    speakerCompany: '',
    status: 'PUBLISHED'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060a12] via-[#09101f] to-[#04070e] text-slate-100 antialiased font-sans flex flex-col">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-xl px-6 lg:px-12 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-wide">
            AlumniConnect Console
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
            <Sparkles className="h-3.5 w-3.5" /> Alumni Host
          </span>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-rose-950/20 text-slate-300 hover:text-rose-400 text-sm font-semibold transition-all duration-300 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 max-w-7xl w-full mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Alumni Events Portal</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Create events, track registrations, and coordinate student attendance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all ${
                activeTab === 'events' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-900 border border-slate-850 text-slate-300 hover:bg-slate-850'
              }`}
            >
              My Created Events
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all ${
                activeTab === 'create' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-900 border border-slate-850 text-slate-300 hover:bg-slate-850'
              }`}
            >
              Create New Event
            </button>
            <button 
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all ${
                activeTab === 'jobs' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-900 border border-slate-850 text-slate-300 hover:bg-slate-850'
              }`}
            >
              My Job Postings
            </button>
            <button 
              onClick={() => setActiveTab('create_job')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all ${
                activeTab === 'create_job' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-900 border border-slate-850 text-slate-300 hover:bg-slate-850'
              }`}
            >
              Post a Job
            </button>
          </div>
        </div>

        {/* Dynamic Views */}
        {activeTab === 'events' ? (
          /* Events list view */
          loading ? (
            <div className="flex h-[40vh] flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-slate-400 text-xs font-semibold">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center p-16 border border-dashed border-slate-900 rounded-3xl">
              <CalendarIcon className="h-10 w-10 text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No events created</h3>
              <p className="text-slate-500 text-xs mt-1">Get started by creating your first event using the top panel.</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-900 bg-slate-950/20 p-5 space-y-4 hover:border-slate-800 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-slate-400">
                      {event.category}
                    </span>
                    
                    {event.approvalStatus === 'APPROVED' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Approved</span>}
                    {event.approvalStatus === 'PENDING' && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Pending Review</span>}
                    {event.approvalStatus === 'REJECTED' && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Rejected</span>}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug truncate">{event.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {event.venue}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {new Date(event.eventDate).toLocaleDateString()} | {event.eventTime}
                    </p>
                  </div>

                  {event.remarks && event.approvalStatus === 'REJECTED' && (
                    <p className="text-[10px] text-rose-400 bg-rose-500/5 border border-rose-500/10 p-2 rounded-lg leading-normal">
                      Remarks: {event.remarks}
                    </p>
                  )}

                  <div className="border-t border-slate-900 pt-3 flex gap-2">
                    <button 
                      onClick={() => loadRegistrants(event)}
                      className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-350 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Users className="h-3.5 w-3.5" /> Registrations
                    </button>
                    <button 
                      onClick={() => setEditingEvent(event)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-blue-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'create' ? (
          /* Create Event Form */
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 md:p-8 shadow-xl shadow-black/10 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-b border-slate-900 pb-2">Event Registration Form</h2>
            
            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Event Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Workshop on Cloud Architecture"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description *</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Provide complete description of the event details..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mode *</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData(prev => ({ ...prev, mode: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Venue *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Lab 4 / Teams Link"
                    value={formData.venue}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Event Date *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Event Time Range *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 10:00 AM - 12:00 PM"
                    value={formData.eventTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Duration *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 2 hours"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Seats Available *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.totalSeats}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalSeats: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registration Deadline *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Google Maps Link (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="https://maps.google.com/..."
                    value={formData.googleMapsLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, googleMapsLocation: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Speaker Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.speakerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, speakerName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Speaker Designation</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Principal Architect"
                    value={formData.speakerDesignation}
                    onChange={(e) => setFormData(prev => ({ ...prev, speakerDesignation: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Speaker Company</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Google India"
                    value={formData.speakerCompany}
                    onChange={(e) => setFormData(prev => ({ ...prev, speakerCompany: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Eligibility Criteria</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Open to 3rd and 4th year CS students"
                    value={formData.eligibilityCriteria}
                    onChange={(e) => setFormData(prev => ({ ...prev, eligibilityCriteria: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Benefits (Comma-separated)</label>
                  <input 
                    type="text" 
                    placeholder="Certificate, Networking, Interview Tips"
                    value={formData.keyBenefits}
                    onChange={(e) => setFormData(prev => ({ ...prev, keyBenefits: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required Items (Comma-separated)</label>
                  <input 
                    type="text" 
                    placeholder="College ID Card, Laptop, Resume Copy"
                    value={formData.requiredDocuments}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiredDocuments: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Agenda Details</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide the event agenda schedule..."
                    value={formData.agenda}
                    onChange={(e) => setFormData(prev => ({ ...prev, agenda: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === 'jobs' ? (
          /* Jobs List view */
          jobsLoading ? (
            <div className="flex h-[40vh] flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-slate-400 text-xs font-semibold">Loading posted jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center p-16 border border-dashed border-slate-900/40 rounded-3xl">
              <Briefcase className="h-10 w-10 text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">No job postings created</h3>
              <p className="text-slate-500 text-xs mt-1">Submit your first job or internship opportunity to get started.</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div key={job.id} className="rounded-2xl border border-slate-900 bg-slate-950/20 p-5 space-y-4 hover:border-slate-800 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-slate-400">
                        {job.jobType === 'FULL_TIME' ? 'Full Time' : job.jobType === 'INTERNSHIP' ? 'Internship' : job.jobType}
                      </span>
                      
                      {job.approvalStatus === 'APPROVED' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Approved</span>}
                      {job.approvalStatus === 'PENDING' && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Pending Review</span>}
                      {job.approvalStatus === 'REJECTED' && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Rejected</span>}
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug truncate">{job.title}</h3>
                      <p className="text-xs text-slate-405 mt-1 font-semibold">{job.company}</p>
                      {job.location && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-600" /> {job.location}
                        </p>
                      )}
                      {job.salary && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-slate-655" /> {job.salary}
                        </p>
                      )}
                    </div>

                    {job.remarks && job.approvalStatus === 'REJECTED' && (
                      <p className="text-[10px] text-rose-400 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-lg leading-normal">
                        CDC Remarks: {job.remarks}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-900 pt-3 flex gap-2">
                    <button 
                      onClick={() => loadApplicants(job)}
                      className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-350 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Users className="h-3.5 w-3.5" /> Applicants
                    </button>
                    <button 
                      onClick={() => handleToggleJobActive(job.id, job.isActive)}
                      className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        job.isActive 
                          ? 'bg-rose-950/20 border-rose-900/35 text-rose-400 hover:bg-rose-900 hover:text-white' 
                          : 'bg-emerald-950/20 border-emerald-900/35 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                      }`}
                    >
                      {job.isActive ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Post a Job Form */
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 md:p-8 shadow-xl shadow-black/10 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-b border-slate-900 pb-2">Post Job Opportunity</h2>
            
            <form onSubmit={handleCreateJob} className="space-y-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Associate Frontend Developer"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. TechMart Solutions"
                    value={jobFormData.company}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-655 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company Logo URL (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="https://images.cloudinary.com/..."
                    value={jobFormData.companyLogo}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, companyLogo: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Type *</label>
                  <select
                    value={jobFormData.jobType}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, jobType: e.target.value as any }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="FREELANCE">Freelance</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Pune, Maharashtra / Remote"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Salary / Stipend Details *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. ₹20,000 / month or ₹6 - 8 LPA"
                    value={jobFormData.salary}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, salary: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Application Deadline</label>
                  <input 
                    type="date"
                    value={jobFormData.deadline}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-350 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required Skills (Comma-separated) *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. React, TypeScript, TailwindCSS"
                    value={jobFormData.skillsRequired}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, skillsRequired: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description *</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Provide full description of the job criteria and roles..."
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Responsibilities</label>
                  <textarea 
                    rows={3}
                    placeholder="Outline key tasks and candidate duties..."
                    value={jobFormData.responsibilities}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Eligibility Criteria</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Open to B.Tech CSIT branch 2026 Batch"
                    value={jobFormData.eligibility}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, eligibility: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Benefits & Perks</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Health insurance, flexible WFH"
                    value={jobFormData.benefits}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, benefits: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Selection Process Details</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MCQ Test -> Technical Interview -> HR Round"
                    value={jobFormData.selectionProcess}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, selectionProcess: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-655 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">External Application Link</label>
                  <input 
                    type="text" 
                    placeholder="https://careers.company.com/..."
                    value={jobFormData.applicationLink}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, applicationLink: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Post Opportunity
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* VIEW REGISTRANTS / ATTENDANCE MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}></div>
          <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl text-slate-200 z-10 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedEvent.title}</h3>
                <p className="text-xs text-slate-400">Total Seats: {selectedEvent.totalSeats} | Left: {selectedEvent.availableSeats}</p>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-lg border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attendance QR scanner / Mark input */}
            <div className="p-4 bg-slate-900/35 border border-slate-900 rounded-xl my-4 shrink-0 space-y-3">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Attendance Verification Desk</h4>
              <form onSubmit={handleMarkAttendance} className="flex gap-2 items-center">
                <input 
                  type="text" 
                  placeholder="Enter Student Registration ID (e.g. AC-XXXXXX)..."
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500"
                />
                <button 
                  type="submit" 
                  disabled={attendanceLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  {attendanceLoading ? 'Processing...' : 'Mark Attended'}
                </button>
              </form>
            </div>

            {/* Registrants List Table */}
            <div className="flex-1 overflow-y-auto pr-2 my-4 custom-scrollbar">
              {registrantsLoading ? (
                <div className="flex h-32 flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <p className="text-slate-500 text-xs font-medium">Fetching registrants list...</p>
                </div>
              ) : registrants.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-8 text-center">No student has registered for this event yet.</p>
              ) : (
                <div className="border border-slate-900 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-350">
                    <thead className="bg-slate-950 border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Enrollment Number</th>
                        <th className="px-4 py-3">Pass ID</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Registered At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40 font-medium text-slate-300">
                      {registrants.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-900/20">
                          <td className="px-4 py-3">
                            <p className="font-bold text-white">{reg.user.studentProfile?.fullName || 'N/A'}</p>
                            <p className="text-[10px] text-slate-550">{reg.user.email}</p>
                          </td>
                          <td className="px-4 py-3">{reg.user.studentProfile?.enrollmentNumber || 'N/A'}</td>
                          <td className="px-4 py-3 font-mono">{reg.registrationId}</td>
                          <td className="px-4 py-3">
                            {reg.status === 'ATTENDED' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Attended</span>}
                            {reg.status === 'REGISTERED' && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Registered</span>}
                            {reg.status === 'CANCELLED' && <span className="bg-slate-900 text-slate-500 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">Cancelled</span>}
                            {reg.status === 'NO_SHOW' && <span className="bg-rose-500/10 text-rose-450 border border-rose-500/25 px-2 py-0.5 rounded text-[10px] font-bold">No Show</span>}
                          </td>
                          <td className="px-4 py-3 text-right text-[10px] text-slate-500">
                            {new Date(reg.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-900 pt-4 flex justify-between shrink-0">
              <button 
                onClick={handleExportRegistrants}
                disabled={registrants.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-350 hover:text-white cursor-pointer disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> Export Registrants (CSV)
              </button>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setEditingEvent(null)}></div>
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl text-slate-200 z-10 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 shrink-0">
              <h3 className="text-lg font-bold text-white">Edit Event: {editingEvent.title}</h3>
              <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleEditEventSubmit} className="flex-1 overflow-y-auto pr-2 my-4 space-y-4 custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Event Title</label>
                <input 
                  type="text" 
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Venue</label>
                <input 
                  type="text" 
                  value={editingEvent.venue}
                  onChange={(e) => setEditingEvent(prev => prev ? ({ ...prev, venue: e.target.value }) : null)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Seats</label>
                <input 
                  type="number" 
                  value={editingEvent.totalSeats}
                  onChange={(e) => setEditingEvent(prev => prev ? ({ ...prev, totalSeats: Number(e.target.value) }) : null)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Speaker Name</label>
                <input 
                  type="text" 
                  value={editingEvent.speakerName}
                  onChange={(e) => setEditingEvent(prev => prev ? ({ ...prev, speakerName: e.target.value }) : null)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                <select
                  value={editingEvent.status}
                  onChange={(e) => setEditingEvent(prev => prev ? ({ ...prev, status: e.target.value as any }) : null)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </form>

            {/* Footer */}
            <div className="border-t border-slate-900 pt-4 flex justify-end gap-2 shrink-0">
              <button 
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                onClick={handleEditEventSubmit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VIEW APPLICANTS / CANDIDATES MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedJob(null)}></div>
          <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl text-slate-200 z-10 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white">Applicants: {selectedJob.title}</h3>
                <p className="text-xs text-slate-400">{selectedJob.company} | Total Applications: {applicants.length}</p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="w-8 h-8 rounded-lg border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Applicants List Table */}
            <div className="flex-1 overflow-y-auto pr-2 my-4 custom-scrollbar">
              {applicantsLoading ? (
                <div className="flex h-32 flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <p className="text-slate-500 text-xs font-medium">Fetching candidate submissions...</p>
                </div>
              ) : applicants.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-8 text-center">No candidates have applied for this posting yet.</p>
              ) : (
                <div className="border border-slate-900 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-350">
                    <thead className="bg-slate-950 border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Branch & Batch</th>
                        <th className="px-4 py-3">Academic Summary</th>
                        <th className="px-4 py-3">Resume</th>
                        <th className="px-4 py-3">Status Pipeline</th>
                        <th className="px-4 py-3 text-right">Applied At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40 font-medium text-slate-300">
                      {applicants.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-900/20">
                          <td className="px-4 py-3 flex items-center gap-2.5">
                            {app.applicant.studentProfile?.profileImage ? (
                              <img src={app.applicant.studentProfile.profileImage} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-800" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-455 border border-slate-800 shrink-0">
                                {app.applicant.studentProfile?.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-white">{app.applicant.studentProfile?.fullName || 'N/A'}</p>
                              <p className="text-[10px] text-slate-550">{app.applicant.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p>{app.applicant.studentProfile?.branch || 'N/A'}</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Batch: {app.applicant.studentProfile?.graduationYear || 'N/A'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded text-[10px] font-bold">
                              CGPA: {app.applicant.studentApplication?.currentCGPA || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <a 
                              href={app.resumeUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-blue-400 hover:underline flex items-center gap-0.5 shrink-0"
                            >
                              Download Resume <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={app.status}
                              disabled={updatingStatusId === app.id}
                              onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                              className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-350 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="APPLIED">Applied</option>
                              <option value="UNDER_REVIEW">Under Review</option>
                              <option value="SHORTLISTED">Shortlisted</option>
                              <option value="INTERVIEW">Interview</option>
                              <option value="OFFERED">Offered</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right text-[10px] text-slate-550 font-semibold">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-900 pt-4 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 border border-slate-855 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Dashboard
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
