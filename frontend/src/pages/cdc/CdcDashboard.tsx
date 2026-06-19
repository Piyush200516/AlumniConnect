import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  LogOut, 
  Search, 
  FileText, 
  X, 
  Loader2, 
  AlertCircle,
  Info,
  Calendar,
  Plus,
  Download,
  Briefcase
} from 'lucide-react';
import { useAuthContext } from '../../components/layout/AuthProvider';
import api from '../../services/api';
import { toastSuccess, toastError } from '../../utils/toast';

interface Application {
  id: string;
  userId: string;
  fullName: string;
  enrollmentNumber: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  profileImage: string;
  aadharNumber: string;
  panCard: string | null;
  collegeIdNumber: string;
  fatherName: string;
  fatherOccupation: string;
  fatherPhone: string;
  motherName: string;
  motherOccupation: string;
  motherPhone: string;
  familyIncome: string;
  emergencyContact: string;
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentPincode: string;
  permanentAddress: string;
  permanentCity: string;
  permanentState: string;
  permanentPincode: string;
  sameAsCurrent: boolean;
  class10Board: string;
  class10School: string;
  class10Percentage: number;
  class10PassingYear: number;
  class12Board: string | null;
  class12School: string | null;
  class12Percentage: number | null;
  class12PassingYear: number | null;
  diplomaCollege: string | null;
  diplomaBranch: string | null;
  diplomaCGPA: number | null;
  diplomaPassingYear: number | null;
  currentCourse: string;
  currentBranch: string;
  currentSemester: number;
  currentCGPA: number;
  sgpaSemester1: number | null;
  sgpaSemester2: number | null;
  sgpaSemester3: number | null;
  sgpaSemester4: number | null;
  sgpaSemester5: number | null;
  sgpaSemester6: number | null;
  sgpaSemester7: number | null;
  sgpaSemester8: number | null;
  careerPreference: string;
  primaryDomain: string;
  secondaryDomain: string | null;
  skills: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  resumeUrl: string;
  status: string;
  remarks: string | null;
  submittedAt: string | null;
  certifications: any[];
}

interface Event {
  id: string;
  title: string;
  category: string;
  description: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  eventDate: string;
  eventTime: string;
  venue: string;
  totalSeats: number;
  availableSeats: number;
  registrationDeadline: string;
  status: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks: string | null;
  speakerName: string;
  speakerDesignation: string | null;
  speakerCompany: string | null;
  createdBy?: {
    email: string;
    role: string;
    alumniProfile?: { fullName: string } | null;
    cdcProfile?: { collegeName: string } | null;
  };
}

interface Registrant {
  id: string;
  registrationId: string;
  status: string;
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

export default function CdcDashboard() {
  const { logout } = useAuthContext();
  
  // Dashboard navigation tab
  const [dashboardTab, setDashboardTab] = useState<'applications' | 'events' | 'jobs'>('applications');
  
  // Tab 1: Student Applications States
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [remarksInput, setRemarksInput] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Tab 2: Events Console States
  const [adminEvents, setAdminEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventRemarks, setEventRemarks] = useState('');
  const [eventActionLoading, setEventActionLoading] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventRegistrations, setEventRegistrations] = useState<Registrant[]>([]);
  const [viewingEventRegistrants, setViewingEventRegistrants] = useState<Event | null>(null);
  const [registrantsLoading, setRegistrantsLoading] = useState(false);

  // Tab 3: Jobs Moderation States
  const [adminJobs, setAdminJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [jobRemarks, setJobRemarks] = useState('');
  const [jobActionLoading, setJobActionLoading] = useState(false);

  // CDC Event creation form data
  const [formData, setFormData] = useState({
    title: '',
    category: 'Workshop',
    description: '',
    mode: 'OFFLINE',
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
    speakerName: '',
    speakerDesignation: '',
    speakerCompany: ''
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
    if (dashboardTab === 'applications') {
      fetchApplications();
    } else if (dashboardTab === 'events') {
      fetchAdminEvents();
    } else {
      fetchAdminJobs();
    }
  }, [dashboardTab]);

  const fetchAdminJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await api.get('/jobs');
      setAdminJobs(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      toastError('Failed to load jobs list for review');
    } finally {
      setJobsLoading(false);
    }
  };

  const handleJobApproval = async (jobId: string, approvalStatus: 'APPROVED' | 'REJECTED') => {
    setJobActionLoading(true);
    try {
      await api.post(`/jobs/${jobId}/${approvalStatus.toLowerCase()}`, {
        approvalStatus,
        remarks: jobRemarks
      });
      toastSuccess(`Job posting has been ${approvalStatus.toLowerCase()}`);
      await fetchAdminJobs();
      setSelectedJob(null);
      setJobRemarks('');
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to update job posting review status');
    } finally {
      setJobActionLoading(false);
    }
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const res = await api.get('/applications');
      setApplications(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      toastError('Failed to fetch applications list');
    } finally {
      setAppsLoading(false);
    }
  };

  const fetchAdminEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await api.get('/events/admin/all');
      setAdminEvents(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      toastError('Failed to load events for review');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleVerify = async (appId: string, status: 'APPROVED' | 'REJECTED' | 'UNDER_VERIFICATION') => {
    setSubmitLoading(true);
    try {
      await api.post(`/applications/${appId}/verify`, {
        status,
        remarks: remarksInput
      });
      toastSuccess(`Application updated to ${status}`);
      await fetchApplications();
      setSelectedApp(null);
      setRemarksInput('');
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to verify application');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEventApproval = async (eventId: string, approvalStatus: 'APPROVED' | 'REJECTED') => {
    setEventActionLoading(true);
    try {
      await api.post(`/events/${eventId}/${approvalStatus.toLowerCase()}`, {
        approvalStatus,
        remarks: eventRemarks
      });
      toastSuccess(`Alumni event has been ${approvalStatus.toLowerCase()}`);
      await fetchAdminEvents();
      setSelectedEvent(null);
      setEventRemarks('');
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to update event review');
    } finally {
      setEventActionLoading(false);
    }
  };

  const handleCreateCdcEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventsLoading(true);
    try {
      const payload = {
        ...formData,
        keyBenefits: formData.keyBenefits.split(',').map(b => b.trim()).filter(Boolean),
        requiredDocuments: formData.requiredDocuments.split(',').map(d => d.trim()).filter(Boolean),
        totalSeats: Number(formData.totalSeats)
      };

      await api.post('/events/create', payload);
      toastSuccess('Official CDC event created and published successfully!');
      
      // Reset form
      setFormData({
        title: '',
        category: 'Workshop',
        description: '',
        mode: 'OFFLINE',
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
        speakerName: '',
        speakerDesignation: '',
        speakerCompany: ''
      });

      setCreateEventOpen(false);
      fetchAdminEvents();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to create official event');
    } finally {
      setEventsLoading(false);
    }
  };

  const loadRegistrants = async (event: Event) => {
    setViewingEventRegistrants(event);
    setRegistrantsLoading(true);
    try {
      const res = await api.get(`/events/${event.id}/registrations`);
      setEventRegistrations(res.data.data || []);
    } catch (err) {
      console.error(err);
      toastError('Failed to fetch event registrants');
    } finally {
      setRegistrantsLoading(false);
    }
  };

  const handleExportRegistrants = (event: Event) => {
    if (eventRegistrations.length === 0) return;
    let csv = 'Registration ID,Full Name,Enrollment Number,Email,Phone,Status,Registered At\n';
    eventRegistrations.forEach(r => {
      csv += `"${r.registrationId}","${r.user.studentProfile?.fullName || ''}","${r.user.studentProfile?.enrollmentNumber || ''}","${r.user.email}","${r.user.studentProfile?.phone || ''}","${r.status}","${new Date(r.createdAt).toLocaleString()}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CDC_Registrants_${event.title.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Applications Filter
  const branches = ['ALL', ...Array.from(new Set(applications.map(app => app.currentBranch || app.diplomaBranch).filter(Boolean) as string[]))];
  
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesBranch = branchFilter === 'ALL' || app.currentBranch === branchFilter || app.diplomaBranch === branchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060a12] via-[#09101f] to-[#04070e] text-slate-100 antialiased font-sans flex flex-col">
      {/* Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-xl px-6 lg:px-12 py-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-wide">
            AlumniConnect CDC Admin
          </span>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-rose-950/20 text-slate-300 hover:text-rose-400 text-sm font-semibold transition-all duration-300 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 max-w-7xl w-full mx-auto space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">CDC Workspace</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Verify applications, moderate alumni events, and organize student workshops.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setDashboardTab('applications')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all ${
                dashboardTab === 'applications' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-900 border border-slate-850 text-slate-300 hover:bg-slate-850'
              }`}
            >
              Portal Approvals
            </button>
            <button 
              onClick={() => setDashboardTab('events')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all ${
                dashboardTab === 'events' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-900 border border-slate-850 text-slate-300 hover:bg-slate-850'
              }`}
            >
              Events Console
            </button>
            <button 
              onClick={() => setDashboardTab('jobs')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all ${
                dashboardTab === 'jobs' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-900 border border-slate-850 text-slate-300 hover:bg-slate-850'
              }`}
            >
              Jobs Moderation
            </button>
          </div>
        </div>

        {/* Tab 1: Student Applications */}
        {dashboardTab === 'applications' ? (
          <div className="space-y-6">
            {/* Search & Filter Controls */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4 p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-lg shadow-black/10">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search by student name, enrollment or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-850 rounded-xl text-sm placeholder-slate-650 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-850 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_VERIFICATION">Under Verification</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DRAFT">Drafts</option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-850 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch === 'ALL' ? 'All Branches' : branch}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Applications Table */}
            {appsLoading ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <p className="text-slate-500 text-xs">Loading student portal applications...</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center p-16 border border-dashed border-slate-900 rounded-3xl">
                <AlertCircle className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">No applications found</h3>
              </div>
            ) : (
              <div className="border border-slate-900 bg-slate-950/40 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Enrollment</th>
                      <th className="px-6 py-4">Course & Branch</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 font-medium">
                    {filteredApps.map(app => (
                      <tr key={app.id} className="hover:bg-slate-900/10">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 border border-slate-850">
                            <img src={app.profileImage} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{app.fullName}</p>
                            <p className="text-[10px] text-slate-500">{app.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-200 font-mono">{app.enrollmentNumber}</td>
                        <td className="px-6 py-4">{app.currentCourse} • {app.currentBranch}</td>
                        <td className="px-6 py-4">
                          {app.status === 'APPROVED' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Approved</span>}
                          {app.status === 'REJECTED' && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Rejected</span>}
                          {app.status === 'UNDER_VERIFICATION' && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded text-[10px] font-bold font-sans">Under Verification</span>}
                          {app.status === 'SUBMITTED' && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Submitted</span>}
                          {app.status === 'DRAFT' && <span className="bg-slate-900 text-slate-550 border border-slate-850 px-2 py-0.5 rounded text-[10px] font-bold">Draft</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => { setRemarksInput(app.remarks || ''); setSelectedApp(app); }}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-[11px] font-bold text-blue-400 hover:text-white cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : dashboardTab === 'events' ? (
          /* Tab 2: Events Console */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">All Scheduled Events</h3>
              <button 
                onClick={() => setCreateEventOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Create CDC Event
              </button>
            </div>

            {eventsLoading ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <p className="text-slate-500 text-xs">Loading Events...</p>
              </div>
            ) : adminEvents.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-8 text-center border border-dashed border-slate-900 rounded-3xl">No events scheduled.</p>
            ) : (
              <div className="border border-slate-900 bg-slate-950/40 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-slate-350">
                  <thead className="bg-slate-950 border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Event Details</th>
                      <th className="px-6 py-4">Speaker</th>
                      <th className="px-6 py-4">Creator</th>
                      <th className="px-6 py-4">Approval</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 font-medium">
                    {adminEvents.map(event => (
                      <tr key={event.id} className="hover:bg-slate-900/10">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white text-sm">{event.title}</p>
                          <p className="text-[10px] text-slate-550 mt-0.5">{event.category} • {event.mode} • {event.venue}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-200">{event.speakerName}</td>
                        <td className="px-6 py-4 text-slate-400">
                          {event.createdBy?.alumniProfile?.fullName || 'CDC Admin'}
                          <span className="block text-[10px] text-slate-550">{event.createdBy?.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          {event.approvalStatus === 'APPROVED' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Approved</span>}
                          {event.approvalStatus === 'PENDING' && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Pending Review</span>}
                          {event.approvalStatus === 'REJECTED' && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Rejected</span>}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => loadRegistrants(event)}
                            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-[10px] text-slate-350 hover:text-white cursor-pointer"
                          >
                            Registrations
                          </button>
                          
                          {event.approvalStatus === 'PENDING' && (
                            <button 
                              onClick={() => { setEventRemarks(event.remarks || ''); setSelectedEvent(event); }}
                              className="px-2.5 py-1.5 bg-blue-600/10 border border-blue-500/25 hover:bg-blue-600 rounded-xl text-[10px] text-blue-400 hover:text-white cursor-pointer"
                            >
                              Verify
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Tab 3: Jobs Moderation Console */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Moderate Alumni Job Postings</h3>
            </div>

            {jobsLoading ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <p className="text-slate-500 text-xs">Loading Job Postings...</p>
              </div>
            ) : adminJobs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-8 text-center border border-dashed border-slate-900/40 rounded-3xl">No jobs posted yet.</p>
            ) : (
              <div className="border border-slate-900 bg-slate-950/40 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-slate-350">
                  <thead className="bg-slate-950 border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Job Details</th>
                      <th className="px-6 py-4">Required Skills</th>
                      <th className="px-6 py-4">Creator Alumni</th>
                      <th className="px-6 py-4">Approval Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 font-medium">
                    {adminJobs.map(job => (
                      <tr key={job.id} className="hover:bg-slate-900/10">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white text-sm">{job.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{job.company} • {job.jobType} • {job.location || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {job.skillsRequired.slice(0, 3).map((s: string, idx: number) => (
                              <span key={idx} className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-slate-405 font-semibold">{s}</span>
                            ))}
                            {job.skillsRequired.length > 3 && <span className="text-[9px] text-slate-550">+{job.skillsRequired.length - 3}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {job.postedBy?.alumniProfile?.fullName || 'CDC Admin'}
                          <span className="block text-[10px] text-slate-550">{job.postedBy?.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          {job.approvalStatus === 'APPROVED' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Approved</span>}
                          {job.approvalStatus === 'PENDING' && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Pending Review</span>}
                          {job.approvalStatus === 'REJECTED' && <span className="bg-rose-500/10 text-rose-455 border border-rose-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Rejected</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => { setJobRemarks(job.remarks || ''); setSelectedJob(job); }}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-[11px] font-bold text-blue-400 hover:text-white cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* PORTAL APPLICATION REVIEW MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedApp(null)}></div>
          
          <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl text-slate-200 z-10 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-900">
                  <img src={selectedApp.profileImage} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedApp.fullName}</h3>
                  <p className="text-xs text-slate-400">Enrollment: {selectedApp.enrollmentNumber} | {selectedApp.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-lg border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto pr-2 my-4 space-y-8 custom-scrollbar text-xs">
              {/* Section A: Contact Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-blue-400 uppercase tracking-wider border-b border-slate-900 pb-1 flex items-center gap-1.5"><Info className="h-4 w-4" /> Contact & Identification</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-semibold text-slate-350">
                  <p><span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Gender</span> {selectedApp.gender || 'N/A'}</p>
                  <p><span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Date of Birth</span> {selectedApp.dateOfBirth ? new Date(selectedApp.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                  <p><span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Mobile Phone</span> {selectedApp.phone || 'N/A'}</p>
                  <p><span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Aadhar Card</span> {selectedApp.aadharNumber || 'N/A'}</p>
                </div>
              </div>

              {/* Section E: Academic Records */}
              <div className="space-y-4">
                <h4 className="font-bold text-blue-400 uppercase tracking-wider border-b border-slate-900 pb-1 flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Academics Breakdown</h4>
                
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10">
                    <h5 className="font-bold text-white mb-2 uppercase">Class 10th</h5>
                    <p><span className="text-slate-500 font-bold">Board:</span> {selectedApp.class10Board}</p>
                    <p><span className="text-slate-500 font-bold">Percentage:</span> {selectedApp.class10Percentage}%</p>
                  </div>
                  {selectedApp.class12Board && (
                    <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10">
                      <h5 className="font-bold text-white mb-2 uppercase">Class 12th</h5>
                      <p><span className="text-slate-500 font-bold">Board:</span> {selectedApp.class12Board}</p>
                      <p><span className="text-slate-500 font-bold">Percentage:</span> {selectedApp.class12Percentage}%</p>
                    </div>
                  )}
                  <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10">
                    <h5 className="font-bold text-white mb-2 uppercase">Graduation</h5>
                    <p><span className="text-slate-500 font-bold">Course:</span> {selectedApp.currentCourse}</p>
                    <p><span className="text-slate-500 font-bold">CGPA:</span> <span className="text-blue-400 font-extrabold">{selectedApp.currentCGPA}</span></p>
                  </div>
                </div>
              </div>

              {/* Resume download */}
              <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5"><FileText className="h-4 w-4 text-blue-400" /> Resume / CV Document (PDF)</span>
                <a 
                  href={selectedApp.resumeUrl}
                  download 
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  Download Resume
                </a>
              </div>
            </div>

            {/* Auditor remarks input */}
            <div className="border-t border-slate-900 pt-4 space-y-4 shrink-0">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">CDC Auditor Remarks</label>
                <input 
                  type="text" 
                  placeholder="Enter remarks or grounds for approval/rejection..."
                  value={remarksInput}
                  onChange={(e) => setRemarksInput(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-900 rounded-xl text-sm placeholder-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <p className="text-[10px] text-slate-500 max-w-sm font-semibold">
                  Audits are logged. Updating the application will lock the verdict and change the status visible on the student's dashboard immediately.
                </p>

                <div className="flex gap-2">
                  <button 
                    disabled={submitLoading}
                    onClick={() => handleVerify(selectedApp.id, 'UNDER_VERIFICATION')}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-850 hover:text-white transition-colors cursor-pointer select-none"
                  >
                    Flag Verification
                  </button>
                  <button 
                    disabled={submitLoading}
                    onClick={() => handleVerify(selectedApp.id, 'REJECTED')}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-rose-950/30 border border-rose-900/60 hover:bg-rose-600 text-rose-400 hover:text-white transition-all cursor-pointer font-semibold select-none"
                  >
                    Reject
                  </button>
                  <button 
                    disabled={submitLoading}
                    onClick={() => handleVerify(selectedApp.id, 'APPROVED')}
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-emerald-950/30 border border-emerald-900/60 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-all cursor-pointer font-semibold select-none"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EVENT APPROVAL / MODERATION MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}></div>
          <div className="relative w-full max-w-md rounded-2xl border border-slate-850 bg-slate-950 p-6 shadow-2xl text-slate-250 z-10 space-y-6">
            
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-md font-bold text-white">Moderate Alumni Event</h3>
                <p className="text-xs text-slate-400">Review request and set approval verdict.</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-900/50 p-4 border border-slate-900 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-white">{selectedEvent.title}</p>
              <p className="text-slate-500">Category: {selectedEvent.category} | Mode: {selectedEvent.mode}</p>
              <p className="text-slate-550 leading-relaxed mt-2">{selectedEvent.description}</p>
              <p className="text-slate-500 mt-2 font-bold">Speaker: {selectedEvent.speakerName} ({selectedEvent.speakerCompany})</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">CDC Remarks</label>
              <input 
                type="text" 
                placeholder="Enter approval/rejection remarks..."
                value={eventRemarks}
                onChange={(e) => setEventRemarks(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-900 rounded-xl text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => handleEventApproval(selectedEvent.id, 'REJECTED')}
                disabled={eventActionLoading}
                className="px-4 py-2 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900 text-rose-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Reject Event
              </button>
              <button 
                onClick={() => handleEventApproval(selectedEvent.id, 'APPROVED')}
                disabled={eventActionLoading}
                className="px-4 py-2 bg-emerald-950/20 border border-emerald-900/30 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Approve & Publish
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CDC OFFICIAL EVENT CREATION MODAL */}
      {createEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setCreateEventOpen(false)}></div>
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl text-slate-200 z-10 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 shrink-0">
              <h3 className="text-lg font-bold text-white">Create Official CDC Event</h3>
              <button onClick={() => setCreateEventOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCdcEvent} className="flex-1 overflow-y-auto pr-2 my-4 space-y-4 custom-scrollbar text-xs">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Event Title *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Resume Building Bootcamp"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl placeholder-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-slate-300 focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description *</label>
                  <textarea 
                    required rows={3}
                    placeholder="Provide details about registration eligibility..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl placeholder-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Venue *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Lab 3, AITR / Teams Link"
                    value={formData.venue}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl placeholder-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date *</label>
                  <input 
                    type="date" required
                    value={formData.eventDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-slate-300 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. 11:00 AM - 01:00 PM"
                    value={formData.eventTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl placeholder-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Duration *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. 2 hours"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl placeholder-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registration Deadline *</label>
                  <input 
                    type="date" required
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-slate-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Seats *</label>
                  <input 
                    type="number" required
                    value={formData.totalSeats}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalSeats: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Speaker Name *</label>
                  <input 
                    type="text" required
                    placeholder="Speaker Name"
                    value={formData.speakerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, speakerName: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl placeholder-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Designation / Company</label>
                  <input 
                    type="text"
                    placeholder="e.g. SDE II at Microsoft"
                    value={formData.speakerDesignation}
                    onChange={(e) => setFormData(prev => ({ ...prev, speakerDesignation: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl placeholder-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </form>

            <div className="border-t border-slate-900 pt-4 flex justify-end gap-2 shrink-0">
              <button 
                onClick={() => setCreateEventOpen(false)}
                className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateCdcEvent}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Create and Publish
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VIEW EVENT REGISTRANTS LIST MODAL */}
      {viewingEventRegistrants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setViewingEventRegistrants(null)}></div>
          <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl text-slate-200 z-10 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white">{viewingEventRegistrants.title} Registrants</h3>
                <p className="text-xs text-slate-400">Total Registered: {eventRegistrations.length}</p>
              </div>
              <button onClick={() => setViewingEventRegistrants(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 my-4 custom-scrollbar">
              {registrantsLoading ? (
                <div className="flex h-32 flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <p className="text-slate-500 text-xs">Loading...</p>
                </div>
              ) : eventRegistrations.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-8 text-center">No registrants found.</p>
              ) : (
                <div className="border border-slate-900 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left text-slate-350">
                    <thead className="bg-slate-950 border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Enrollment</th>
                        <th className="px-4 py-3">Branch</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40 text-slate-300 font-medium">
                      {eventRegistrations.map(reg => (
                        <tr key={reg.id} className="hover:bg-slate-900/20">
                          <td className="px-4 py-3">{reg.user.studentProfile?.fullName || 'N/A'}</td>
                          <td className="px-4 py-3 font-mono">{reg.user.studentProfile?.enrollmentNumber || 'N/A'}</td>
                          <td className="px-4 py-3">{reg.user.studentProfile?.branch || 'N/A'}</td>
                          <td className="px-4 py-3">
                            {reg.status === 'ATTENDED' && <span className="text-emerald-400">Attended</span>}
                            {reg.status === 'REGISTERED' && <span className="text-blue-400">Registered</span>}
                            {reg.status === 'CANCELLED' && <span className="text-slate-500">Cancelled</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border-t border-slate-900 pt-4 flex justify-between shrink-0">
              <button 
                onClick={() => handleExportRegistrants(viewingEventRegistrants)}
                disabled={eventRegistrations.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-350 hover:text-white cursor-pointer disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> Export Report (CSV)
              </button>
              <button 
                onClick={() => setViewingEventRegistrants(null)}
                className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CDC JOB APPROVAL / MODERATION MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedJob(null)}></div>
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-850 bg-slate-950 p-6 shadow-2xl text-slate-200 z-10 space-y-6">
            
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-md font-bold text-white">Moderate Alumni Job Posting</h3>
                <p className="text-xs text-slate-400">Review request and set approval verdict.</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-900/50 p-4 border border-slate-900 rounded-xl space-y-1 text-xs max-h-[30vh] overflow-y-auto custom-scrollbar">
              <p className="font-bold text-white text-sm">{selectedJob.title}</p>
              <p className="text-slate-400 font-semibold">{selectedJob.company} • {selectedJob.jobType}</p>
              <p className="text-slate-500">Location: {selectedJob.location || 'N/A'} | Salary: {selectedJob.salary || 'N/A'}</p>
              <p className="text-slate-405 leading-relaxed mt-2.5 whitespace-pre-wrap">{selectedJob.description}</p>
              
              {selectedJob.responsibilities && (
                <div className="mt-3.5 border-t border-slate-900/60 pt-2.5">
                  <p className="font-bold text-white">Responsibilities:</p>
                  <p className="text-slate-405 mt-1 whitespace-pre-wrap">{selectedJob.responsibilities}</p>
                </div>
              )}
              {selectedJob.eligibility && (
                <div className="mt-2.5">
                  <p className="font-bold text-white">Eligibility Criteria:</p>
                  <p className="text-slate-405 mt-1 whitespace-pre-wrap">{selectedJob.eligibility}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">CDC Remarks</label>
              <input 
                type="text" 
                placeholder="Enter approval/rejection remarks..."
                value={jobRemarks}
                onChange={(e) => setJobRemarks(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-900 rounded-xl text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500 text-slate-200"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => handleJobApproval(selectedJob.id, 'REJECTED')}
                disabled={jobActionLoading}
                className="px-4 py-2 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900 text-rose-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Reject Posting
              </button>
              <button 
                onClick={() => handleJobApproval(selectedJob.id, 'APPROVED')}
                disabled={jobActionLoading}
                className="px-4 py-2 bg-emerald-950/20 border border-emerald-900/30 hover:bg-emerald-600 text-emerald-450 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Approve & Publish
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
