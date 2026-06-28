import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  Briefcase,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  GraduationCap,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useAuthContext } from '../../components/layout/AuthProvider';
import api from '../../services/api';
import { toastError, toastSuccess } from '../../utils/toast';

type DashboardTab = 'overview' | 'applications' | 'people' | 'events' | 'jobs';
type PeopleView = 'students' | 'placed' | 'alumni';
type ApplicationStatusFilter = 'ALL' | 'DRAFT' | 'SUBMITTED' | 'UNDER_VERIFICATION' | 'APPROVED' | 'REJECTED';
type EventStatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
type JobStatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface DashboardStats {
  studentUsersCount: number;
  alumniUsersCount: number;
  totalApplications: number;
  verifiedApplications: number;
  pendingApplications: number;
  placedStudentsCount: number;
  upcomingEventsCount: number;
  pendingEventCount: number;
  activeJobsCount: number;
}

interface CdcApplication {
  id: string;
  userId: string;
  fullName: string;
  enrollmentNumber: string;
  email: string;
  phone: string;
  currentCourse: string;
  currentBranch: string;
  currentSemester: number;
  currentCGPA: number;
  primaryDomain: string;
  secondaryDomain: string | null;
  skills: string[];
  resumeUrl: string;
  profileImage: string;
  status: string;
  remarks: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  user: { email: string };
  certifications: Array<{
    id?: string;
    name: string;
    issuingOrganization: string;
    issueDate: string;
    certificateUrl: string;
  }>;
  [key: string]: any;
}

interface CdcAlumni {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  passingYear: number;
  branch: string | null;
  course: string | null;
  currentCompany: string | null;
  designation: string | null;
  location: string | null;
  profileImageUrl: string | null;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    location: string | null;
  } | null;
  [key: string]: any;
}

interface CdcPlacedStudent {
  id: string;
  name: string;
  email: string;
  enrollmentNumber: string;
  branch: string;
  course: string;
  graduationYear: number | null;
  phone: string | null;
  company: string;
  jobTitle: string;
  status: string;
  updatedAt: string;
}

interface CdcEvent {
  id: string;
  createdById: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  category: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  eventDate: string;
  eventTime: string;
  duration: string;
  venue: string;
  googleMapsLocation: string | null;
  totalSeats: number;
  availableSeats: number;
  registrationDeadline: string;
  status: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks: string | null;
  agenda: string | null;
  keyBenefits: string[];
  eligibilityCriteria: string | null;
  requiredDocuments: string[];
  speakerName: string;
  speakerDesignation: string | null;
  speakerCompany: string | null;
  createdBy: {
    id: string;
    role: 'STUDENT' | 'ALUMNI' | 'CDC';
    email: string;
    alumniProfile?: { fullName: string } | null;
    cdcProfile?: { collegeName: string } | null;
  };
  _count: { registrations: number };
  [key: string]: any;
}

interface CdcJob {
  id: string;
  postedById: string;
  title: string;
  description: string;
  company: string;
  companyLogo: string | null;
  location: string | null;
  salary: string | null;
  jobType: string;
  skillsRequired: string[];
  deadline: string | null;
  isActive: boolean;
  responsibilities: string | null;
  eligibility: string | null;
  benefits: string | null;
  selectionProcess: string | null;
  applicationLink: string | null;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks: string | null;
  postedBy: {
    id: string;
    role: 'STUDENT' | 'ALUMNI' | 'CDC';
    email: string;
    alumniProfile?: { fullName: string; designation: string | null; currentCompany: string | null } | null;
    cdcProfile?: { collegeName: string } | null;
  };
  _count: { applications: number };
  [key: string]: any;
}

interface CdcRegistrant {
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

interface CdcDashboardData {
  stats: DashboardStats;
  applications: CdcApplication[];
  alumni: CdcAlumni[];
  placedStudents: CdcPlacedStudent[];
  events: CdcEvent[];
  jobs: CdcJob[];
}

const dashboardTabs: Array<{
  id: DashboardTab;
  label: string;
  icon: any;
}> = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'applications', label: 'Applications', icon: ShieldCheck },
    { id: 'people', label: 'People', icon: Users },
    { id: 'events', label: 'Events', icon: CalendarIcon },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
  ];

const eventCategories = [
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
  'Career Guidance Session',
];

function buildInitialEventForm() {
  return {
    title: '',
    category: 'Workshop',
    description: '',
    bannerUrl: '',
    mode: 'OFFLINE' as 'ONLINE' | 'OFFLINE' | 'HYBRID',
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
    speakerCompany: '',
    hostedByAlumniName: '',
    hostedByAlumniEmail: '',
  };
}

function formatDate(value?: string | Date | null) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate' | 'violet';
}) {
  const toneClass: Record<'emerald' | 'amber' | 'rose' | 'blue' | 'slate' | 'violet', string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    slate: 'bg-slate-900/80 text-slate-300 border-slate-800',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${toneClass[tone]}`}>
      {label}
    </span>
  );
}

function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: any;
}) {
  return (
    <div className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-7 shadow-xl shadow-black/10 backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/15 bg-blue-500/10 text-blue-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-xs font-medium text-slate-400">{hint}</p>
    </div>
  );
}

function PlacementTrendsChart({ placedStudents }: { placedStudents: CdcPlacedStudent[] }) {
  const branchCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    placedStudents.forEach(p => {
      const branch = p.branch || 'Other';
      counts[branch] = (counts[branch] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [placedStudents]);

  const maxCount = Math.max(...branchCounts.map(b => b[1]), 1);

  return (
    <div className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-7 shadow-xl shadow-black/10 backdrop-blur-xl flex flex-col justify-between min-h-[220px]">
      <div>
        <h3 className="text-sm font-bold text-white">Placement Trends</h3>
        <p className="text-xs text-slate-400">By top branches</p>
      </div>
      <div className="mt-6 flex h-32 items-end gap-4">
        {branchCounts.length === 0 ? (
          <div className="w-full flex h-full items-center justify-center text-xs text-slate-600">No data available</div>
        ) : (
          branchCounts.map(([branch, count]) => (
            <div key={branch} className="flex flex-1 flex-col items-center gap-2 group">
              <div className="w-full relative flex justify-center h-[100px] items-end">
                <div 
                  className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-blue-600/20 to-blue-500/80 transition-all group-hover:to-blue-400"
                  style={{ height: `${(count / maxCount) * 100}%` }}
                ></div>
                <span className="absolute -top-6 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">{count}</span>
              </div>
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase truncate w-full text-center" title={branch}>
                {branch.substring(0, 4)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StudentGrowthChart({ applications }: { applications: CdcApplication[] }) {
  const verifiedCount = applications.filter(a => a.status === 'APPROVED').length;
  const pendingCount = applications.filter(a => a.status === 'UNDER_VERIFICATION').length;
  const draftCount = applications.length - verifiedCount - pendingCount;

  return (
    <div className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-7 shadow-xl shadow-black/10 backdrop-blur-xl flex flex-col justify-between min-h-[220px]">
      <div>
        <h3 className="text-sm font-bold text-white">Student Funnel</h3>
        <p className="text-xs text-slate-400">Applications status</p>
      </div>
      <div className="mt-6 flex flex-col gap-5 justify-end h-32">
        <div className="flex items-center gap-4">
          <div className="w-16 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Verified</div>
          <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${applications.length ? (verifiedCount / applications.length) * 100 : 0}%` }}></div>
          </div>
          <div className="w-8 text-[10px] font-bold text-white">{verifiedCount}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending</div>
          <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${applications.length ? (pendingCount / applications.length) * 100 : 0}%` }}></div>
          </div>
          <div className="w-8 text-[10px] font-bold text-white">{pendingCount}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Draft</div>
          <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden">
            <div className="h-full bg-slate-600 rounded-full" style={{ width: `${applications.length ? (draftCount / applications.length) * 100 : 0}%` }}></div>
          </div>
          <div className="w-8 text-[10px] font-bold text-white">{draftCount}</div>
        </div>
      </div>
    </div>
  );
}

function EventStatsChart({ events }: { events: CdcEvent[] }) {
  const topEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => (b._count?.registrations || 0) - (a._count?.registrations || 0))
      .slice(0, 3);
  }, [events]);

  return (
    <div className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-7 shadow-xl shadow-black/10 backdrop-blur-xl flex flex-col justify-between min-h-[220px]">
      <div>
        <h3 className="text-sm font-bold text-white">Top Events</h3>
        <p className="text-xs text-slate-400">By registrations</p>
      </div>
      <div className="mt-6 flex flex-col gap-4 justify-end h-32">
        {topEvents.length === 0 ? (
          <div className="w-full flex h-full items-center justify-center text-xs text-slate-600">No events</div>
        ) : (
          topEvents.map(event => {
            const regCount = event._count?.registrations || 0;
            const percent = event.totalSeats ? (regCount / event.totalSeats) * 100 : 0;
            return (
              <div key={event.id} className="group relative">
                <div className="flex justify-between items-end text-[10px] font-bold text-slate-400 mb-2">
                  <span className="truncate max-w-[150px]">{event.title}</span>
                  <span>{regCount} / {event.totalSeats}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all group-hover:brightness-125" style={{ width: `${Math.min(percent, 100)}%` }}></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function CdcDashboard() {
  const { user, logout } = useAuthContext();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [peopleView, setPeopleView] = useState<PeopleView>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<ApplicationStatusFilter>('ALL');
  const [eventStatusFilter, setEventStatusFilter] = useState<EventStatusFilter>('ALL');
  const [jobStatusFilter, setJobStatusFilter] = useState<JobStatusFilter>('ALL');

  const [dashboard, setDashboard] = useState<CdcDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedApplication, setSelectedApplication] = useState<CdcApplication | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CdcEvent | null>(null);
  const [selectedJob, setSelectedJob] = useState<CdcJob | null>(null);
  const [registrantsEvent, setRegistrantsEvent] = useState<CdcEvent | null>(null);
  const [registrants, setRegistrants] = useState<CdcRegistrant[]>([]);
  const [registrantsLoading, setRegistrantsLoading] = useState(false);

  const [applicationRemarks, setApplicationRemarks] = useState('');
  const [eventRemarks, setEventRemarks] = useState('');
  const [jobRemarks, setJobRemarks] = useState('');
  const [applicationActionLoading, setApplicationActionLoading] = useState(false);
  const [eventActionLoading, setEventActionLoading] = useState(false);
  const [jobActionLoading, setJobActionLoading] = useState(false);

  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [eventForm, setEventForm] = useState(buildInitialEventForm());

  const loadDashboard = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setLoadError(null);
    try {
      const res = await api.get('/cdc/dashboard');
      setDashboard(res.data.data);
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || 'Failed to load CDC dashboard';
      setLoadError(message);
      toastError(message);
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const stats = dashboard?.stats ?? {
    studentUsersCount: 0,
    alumniUsersCount: 0,
    totalApplications: 0,
    verifiedApplications: 0,
    pendingApplications: 0,
    placedStudentsCount: 0,
    upcomingEventsCount: 0,
    pendingEventCount: 0,
    activeJobsCount: 0,
  };

  const applications = dashboard?.applications ?? [];
  const alumni = dashboard?.alumni ?? [];
  const placedStudents = dashboard?.placedStudents ?? [];
  const events = dashboard?.events ?? [];
  const jobs = dashboard?.jobs ?? [];

  const placedLookup = useMemo(() => {
    return new Map(placedStudents.map((placed) => [placed.id, placed]));
  }, [placedStudents]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          application.fullName,
          application.email,
          application.enrollmentNumber,
          application.currentBranch,
          application.currentCourse,
          application.primaryDomain,
        ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));

      const matchesStatus =
        applicationStatusFilter === 'ALL' || application.status === applicationStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, applicationStatusFilter, normalizedSearch]);

  const filteredStudents = useMemo(() => {
    return applications.filter((application) => {
      const placement = placedLookup.get(application.userId);
      const matchesSearch =
        !normalizedSearch ||
        [
          application.fullName,
          application.email,
          application.enrollmentNumber,
          application.currentBranch,
          application.currentCourse,
          placement?.company,
          placement?.jobTitle,
        ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));

      if (!matchesSearch) return false;

      if (peopleView === 'students') return true;
      if (peopleView === 'placed') return !!placement;
      return false;
    });
  }, [applications, normalizedSearch, peopleView, placedLookup]);

  const filteredAlumni = useMemo(() => {
    return alumni.filter((alumnus) => {
      const matchesSearch =
        !normalizedSearch ||
        [alumnus.fullName, alumnus.email, alumnus.currentCompany, alumnus.designation, alumnus.location].some((value) =>
          String(value || '').toLowerCase().includes(normalizedSearch)
        );
      return matchesSearch;
    });
  }, [alumni, normalizedSearch]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        !normalizedSearch ||
        [event.title, event.category, event.speakerName, event.venue, event.createdBy?.email].some((value) =>
          String(value || '').toLowerCase().includes(normalizedSearch)
        );

      const matchesStatus =
        eventStatusFilter === 'ALL' || event.approvalStatus === eventStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, eventStatusFilter, normalizedSearch]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !normalizedSearch ||
        [job.title, job.company, job.location, job.postedBy?.email, ...(job.skillsRequired || [])].some((value) =>
          String(value || '').toLowerCase().includes(normalizedSearch)
        );

      const matchesStatus =
        jobStatusFilter === 'ALL' || job.approvalStatus === jobStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, jobStatusFilter, normalizedSearch]);

  const pendingApplications = applications.filter(
    (application) =>
      application.status === 'DRAFT' ||
      application.status === 'SUBMITTED' ||
      application.status === 'UNDER_VERIFICATION'
  );
  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.eventDate);
    return event.approvalStatus === 'APPROVED' && event.status === 'PUBLISHED' && eventDate >= new Date();
  });

  const handleRefresh = async () => {
    await loadDashboard(true);
  };

  const handleApplicationDecision = async (
    applicationId: string,
    status: 'APPROVED' | 'REJECTED' | 'UNDER_VERIFICATION'
  ) => {
    setApplicationActionLoading(true);
    try {
      await api.post(`/applications/${applicationId}/verify`, {
        status,
        remarks: applicationRemarks,
      });
      toastSuccess(`Application updated to ${status.toLowerCase().replace('_', ' ')}`);
      setSelectedApplication(null);
      setApplicationRemarks('');
      await loadDashboard(true);
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setApplicationActionLoading(false);
    }
  };

  const handleEventDecision = async (eventId: string, approvalStatus: 'APPROVED' | 'REJECTED') => {
    setEventActionLoading(true);
    try {
      const actionPath = approvalStatus === 'APPROVED' ? 'approve' : 'reject';
      await api.post(`/events/${eventId}/${actionPath}`, {
        approvalStatus,
        remarks: eventRemarks,
      });
      toastSuccess(`Event ${approvalStatus.toLowerCase()}`);
      setSelectedEvent(null);
      setEventRemarks('');
      await loadDashboard(true);
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to update event review');
    } finally {
      setEventActionLoading(false);
    }
  };

  const handleJobDecision = async (jobId: string, approvalStatus: 'APPROVED' | 'REJECTED') => {
    setJobActionLoading(true);
    try {
      const actionPath = approvalStatus === 'APPROVED' ? 'approve' : 'reject';
      await api.post(`/jobs/${jobId}/${actionPath}`, {
        approvalStatus,
        remarks: jobRemarks,
      });
      toastSuccess(`Job ${approvalStatus.toLowerCase()}`);
      setSelectedJob(null);
      setJobRemarks('');
      await loadDashboard(true);
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to update job review');
    } finally {
      setJobActionLoading(false);
    }
  };

  const handleCreateEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreatingEvent(true);
    try {
      const payload = {
        title: eventForm.title,
        category: eventForm.category,
        description: eventForm.description,
        bannerUrl: eventForm.bannerUrl.trim() || undefined,
        mode: eventForm.mode,
        eventDate: eventForm.eventDate,
        eventTime: eventForm.eventTime,
        duration: eventForm.duration,
        venue: eventForm.venue,
        googleMapsLocation: eventForm.googleMapsLocation.trim() || undefined,
        totalSeats: Number(eventForm.totalSeats),
        registrationDeadline: eventForm.registrationDeadline,
        agenda: eventForm.agenda.trim() || undefined,
        keyBenefits: splitCsv(eventForm.keyBenefits),
        eligibilityCriteria: eventForm.eligibilityCriteria.trim() || undefined,
        requiredDocuments: splitCsv(eventForm.requiredDocuments),
        speakerName: eventForm.speakerName,
        speakerDesignation: eventForm.speakerDesignation.trim() || undefined,
        speakerCompany: eventForm.speakerCompany.trim() || undefined,
        hostedByAlumniName: eventForm.hostedByAlumniName.trim() || undefined,
        hostedByAlumniEmail: eventForm.hostedByAlumniEmail.trim() || undefined,
      };

      await api.post('/events/create', payload);
      toastSuccess('Event created successfully');
      setCreateEventOpen(false);
      setEventForm(buildInitialEventForm());
      await loadDashboard(true);
    } catch (err: any) {
      console.error(err);
      toastError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to create event'
      );
    } finally {
      setCreatingEvent(false);
    }
  };

  const loadRegistrants = async (event: CdcEvent) => {
    setRegistrantsEvent(event);
    setRegistrantsLoading(true);
    try {
      const res = await api.get(`/events/${event.id}/registrations`);
      setRegistrants(res.data.data || []);
    } catch (err) {
      console.error(err);
      toastError('Failed to fetch registrants');
    } finally {
      setRegistrantsLoading(false);
    }
  };

  const exportRegistrants = () => {
    if (!registrantsEvent || registrants.length === 0) return;

    let csv = 'Registration ID,Full Name,Enrollment Number,Email,Phone,Status,Registered At\n';
    registrants.forEach((reg) => {
      csv += `"${reg.registrationId}","${reg.user.studentProfile?.fullName || ''}","${reg.user.studentProfile?.enrollmentNumber || ''}","${reg.user.email}","${reg.user.studentProfile?.phone || ''}","${reg.status}","${formatDateTime(reg.createdAt)}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CDC_Registrants_${registrantsEvent.title.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSidebarItem = (tab: DashboardTab, label: string, Icon: any) => {
    const active = activeTab === tab;
    return (
      <button
        key={tab}
        onClick={() => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        className={`group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-out ${
          active
            ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 text-blue-400 ring-1 ring-blue-500/20 shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)]'
            : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
        }`}
      >
        <Icon className={`h-4.5 w-4.5 shrink-0 transition-colors duration-300 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span>{label}</span>
        {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-80" />}
      </button>
    );
  };

  const pageTitle =
    activeTab === 'overview'
      ? 'CDC Control Room'
      : activeTab === 'applications'
        ? 'Student Applications'
        : activeTab === 'people'
          ? 'Students, Placements, Alumni'
          : activeTab === 'events'
            ? 'Events Console'
            : 'Jobs Moderation';

  const pageSubtitle =
    activeTab === 'overview'
      ? 'Manage students, events, and placements.'
      : activeTab === 'applications'
        ? 'Review student portal applications and update approval status.'
        : activeTab === 'people'
          ? 'Quickly see who is studying, who has been placed, and who is already an alumnus.'
          : activeTab === 'events'
            ? 'Create events for the college or attach them to a specific alumni portal.'
            : 'Approve job postings and track candidate traffic.';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#060a12] via-[#09101f] to-[#04070e] text-slate-100 antialiased font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-900 bg-slate-950/60 px-8 py-10 shadow-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-sm font-semibold text-slate-400">Loading CDC workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060a12] via-[#09101f] to-[#04070e] text-slate-100 antialiased font-sans">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] border-r border-slate-900/80 bg-[#060a12]/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:block`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 py-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Elegant Logo Section */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-bold tracking-tight text-white">AlumniConnect</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400/80">CDC Console</p>
            </div>
          </div>

          {/* Navigation Group */}
          <div className="mt-10 px-2">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Menu</p>
            <nav className="space-y-1.5">
              {dashboardTabs.map((item) => renderSidebarItem(item.id, item.label, item.icon))}
            </nav>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Thin Divider */}
          <div className="my-4 h-px w-full bg-slate-900/80" />

          {/* Compact User Profile & Logout */}
          <div className="px-2 pb-2">
            <div className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-white truncate max-w-[100px]">
                    {user?.role ? `${user.role.toUpperCase()}` : 'CDC User'}
                  </p>
                  <p className="text-[10px] text-slate-500">Workspace</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-slate-900/70 bg-slate-950/60 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-900 bg-slate-950/60 text-slate-300 transition-colors hover:bg-slate-900 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-extrabold tracking-tight text-white">{pageTitle}</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-400">{pageSubtitle}</p>
            </div>

            <div className="hidden min-w-[260px] flex-1 max-w-xl items-center rounded-2xl border border-slate-900 bg-slate-950/60 px-4 py-2.5 shadow-xl shadow-black/10 md:flex">
              <Search className="h-4.5 w-4.5 text-slate-500" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students, alumni, events, jobs..."
                className="ml-3 w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-900 bg-slate-950/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-slate-700 hover:text-white"
            >
              <Loader2 className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
              Refresh
            </button>

            <button
              onClick={logout}
              className="hidden items-center gap-2 rounded-2xl border border-slate-900 bg-slate-950/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-rose-500/30 hover:text-rose-300 xl:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {loadError && (
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-200">
              <p className="font-bold">Dashboard load error</p>
              <p className="mt-1 text-sm text-rose-100/80">{loadError}</p>
            </div>
          )}

          <div className="flex flex-col gap-6 md:h-[130px] md:flex-row md:items-center md:justify-between rounded-3xl border border-slate-900/80 bg-slate-950/50 p-8 shadow-xl shadow-black/10 backdrop-blur-xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                CDC Workspace
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                CDC Command Center
              </h2>
              <p className="text-sm text-slate-400">
                Verify profiles, approve events, and monitor student placements.
              </p>
            </div>

            <div className="flex flex-row items-center gap-4">
              <button
                onClick={() => setActiveTab('applications')}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-900 bg-slate-900/50 px-5 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-900"
              >
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                Review Applications
              </button>
              <button
                onClick={() => {
                  setActiveTab('events');
                  setCreateEventOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="Student Accounts"
                  value={stats.studentUsersCount}
                  hint="Total registered students"
                  icon={GraduationCap}
                />
                <MetricCard
                  title="Placed Students"
                  value={stats.placedStudentsCount}
                  hint="Students with an offer"
                  icon={Briefcase}
                />
                <MetricCard
                  title="Active Alumni"
                  value={stats.alumniUsersCount}
                  hint="Graduated profiles"
                  icon={Users}
                />
                <MetricCard
                  title="Pending Reviews"
                  value={stats.pendingApplications}
                  hint="Action required"
                  icon={ShieldCheck}
                />
              </div>

              {/* Secondary Metrics Row */}
              <div className="flex flex-wrap items-center gap-8 rounded-3xl border border-slate-900/80 bg-slate-950/50 p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/50 text-slate-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Verified Profiles</p>
                    <p className="text-xl font-bold text-white">{stats.verifiedApplications}</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-900/80 hidden sm:block"></div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/50 text-slate-400">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Upcoming Events</p>
                    <p className="text-xl font-bold text-white">{stats.upcomingEventsCount}</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-900/80 hidden sm:block"></div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/50 text-slate-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Active Jobs</p>
                    <p className="text-xl font-bold text-white">{stats.activeJobsCount}</p>
                  </div>
                </div>
              </div>

              {/* Analytics & Trends Section */}
              <div className="grid gap-6 lg:grid-cols-3">
                <PlacementTrendsChart placedStudents={placedStudents} />
                <StudentGrowthChart applications={applications} />
                <EventStatsChart events={events} />
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <section className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-8 shadow-xl shadow-black/10 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Pending Actions</h3>
                      <p className="mt-1 text-sm text-slate-400">Applications requiring verification.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="text-xs font-bold uppercase tracking-wider text-blue-400 transition-colors hover:text-blue-300"
                    >
                      View all
                    </button>
                  </div>
                  <div className="mt-6 space-y-4">
                    {(pendingApplications.slice(0, 5)).map((application) => {
                      const placement = placedLookup.get(application.userId);
                      return (
                        <div key={application.id} className="rounded-2xl border border-slate-900 bg-slate-900/35 p-5 transition-all hover:bg-slate-900/50">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-base font-bold text-white">{application.fullName}</p>
                              <p className="mt-1 text-sm text-slate-500">
                                {application.enrollmentNumber} • {application.currentBranch}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <StatusChip
                                  label={application.status.replace('_', ' ')}
                                  tone={
                                    application.status === 'APPROVED'
                                      ? 'emerald'
                                      : application.status === 'REJECTED'
                                        ? 'rose'
                                        : application.status === 'UNDER_VERIFICATION'
                                          ? 'amber'
                                          : 'blue'
                                  }
                                />
                                {placement && <StatusChip label="PLACED" tone="violet" />}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setApplicationRemarks(application.remarks || '');
                                setSelectedApplication(application);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-xs font-bold text-blue-300 transition-colors hover:bg-blue-500 hover:text-white"
                            >
                              Review
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {pendingApplications.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-900 p-8 text-center text-sm text-slate-500">
                        No pending student applications.
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-8 shadow-xl shadow-black/10 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
                      <p className="mt-1 text-sm text-slate-400">Published events open for registration.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('events')}
                      className="text-xs font-bold uppercase tracking-wider text-blue-400 transition-colors hover:text-blue-300"
                    >
                      View all
                    </button>
                  </div>
                  <div className="mt-6 space-y-4">
                    {upcomingEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="rounded-2xl border border-slate-900 bg-slate-900/35 p-5 transition-all hover:bg-slate-900/50">
                        <p className="text-base font-bold text-white">{event.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {event.category} • {event.mode} • {event.venue}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <StatusChip label={event.approvalStatus} tone="emerald" />
                          <StatusChip label={event.createdBy.role} tone="slate" />
                        </div>
                      </div>
                    ))}
                    {upcomingEvents.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-900 p-8 text-center text-sm text-slate-500">
                        No upcoming events yet.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <section className="space-y-6">
              <div className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
                <div className="grid gap-4 lg:grid-cols-4">
                  <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-900/35 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Search className="h-4.5 w-4.5 text-slate-500" />
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, enrollment, branch, domain..."
                        className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-slate-900/35 px-4 py-3">
                    <select
                      value={applicationStatusFilter}
                      onChange={(e) => setApplicationStatusFilter(e.target.value as ApplicationStatusFilter)}
                      className="w-full bg-transparent text-sm text-slate-200 focus:outline-none"
                    >
                      <option value="ALL">All statuses</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_VERIFICATION">Under verification</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-slate-900/35 px-4 py-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Visible</span>
                      <span className="text-slate-200">{filteredApplications.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {filteredApplications.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-900 p-16 text-center text-sm text-slate-500">
                  No applications found.
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredApplications.map((application) => {
                    const placement = placedLookup.get(application.userId);
                    return (
                      <article
                        key={application.id}
                        className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
                      >
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-lg font-black text-blue-300">
                              {(application.fullName || 'S').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-bold text-white">{application.fullName}</h3>
                                <StatusChip
                                  label={application.status.replace('_', ' ')}
                                  tone={
                                    application.status === 'APPROVED'
                                      ? 'emerald'
                                      : application.status === 'REJECTED'
                                        ? 'rose'
                                        : application.status === 'UNDER_VERIFICATION'
                                          ? 'amber'
                                          : 'blue'
                                  }
                                />
                                {placement && <StatusChip label="PLACED" tone="violet" />}
                              </div>
                              <p className="mt-1 text-sm text-slate-400">
                                {application.enrollmentNumber} • {application.currentCourse} • {application.currentBranch}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <StatusChip label={`CGPA ${application.currentCGPA}`} tone="slate" />
                                <StatusChip label={`Semester ${application.currentSemester}`} tone="slate" />
                                {placement && <StatusChip label={placement.company} tone="violet" />}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => {
                                setApplicationRemarks(application.remarks || '');
                                setSelectedApplication(application);
                              }}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-900 bg-slate-900/50 px-4 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-900"
                            >
                              Review
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === 'people' && (
            <section className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {(['students', 'placed', 'alumni'] as PeopleView[]).map((view) => (
                  <button
                    key={view}
                    onClick={() => setPeopleView(view)}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-bold capitalize transition-all ${peopleView === view
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'border border-slate-900 bg-slate-950/60 text-slate-300 hover:bg-slate-900'
                      }`}
                  >
                    {view}
                  </button>
                ))}
              </div>

              {peopleView === 'students' && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredStudents.map((application) => {
                    const placement = placedLookup.get(application.userId);
                    return (
                      <article
                        key={application.id}
                        className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-bold text-white">{application.fullName}</p>
                            <p className="text-sm text-slate-400">{application.enrollmentNumber}</p>
                          </div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
                            <GraduationCap className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <StatusChip
                            label={application.status.replace('_', ' ')}
                            tone={
                              application.status === 'APPROVED'
                                ? 'emerald'
                                : application.status === 'REJECTED'
                                  ? 'rose'
                                  : application.status === 'UNDER_VERIFICATION'
                                    ? 'amber'
                                    : 'blue'
                            }
                          />
                          {placement ? <StatusChip label="PLACED" tone="violet" /> : <StatusChip label="IN COLLEGE" tone="slate" />}
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-400">
                          <p>{application.currentCourse} • {application.currentBranch}</p>
                          <p>{application.email}</p>
                          {placement && <p className="text-violet-300">{placement.company} • {placement.jobTitle}</p>}
                        </div>
                      </article>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-900 p-12 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                      No students match your search.
                    </div>
                  )}
                </div>
              )}

              {peopleView === 'placed' && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {placedStudents
                    .filter((placement) =>
                      !normalizedSearch ||
                      [placement.name, placement.email, placement.company, placement.jobTitle, placement.branch].some((value) =>
                        String(value || '').toLowerCase().includes(normalizedSearch)
                      )
                    )
                    .map((placement) => (
                      <article
                        key={placement.id}
                        className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-bold text-white">{placement.name}</p>
                            <p className="text-sm text-slate-400">{placement.email}</p>
                          </div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                            <Briefcase className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <StatusChip label="PLACED" tone="violet" />
                          <StatusChip label={placement.branch || 'Student'} tone="slate" />
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-400">
                          <p>{placement.company}</p>
                          <p>{placement.jobTitle}</p>
                          <p>{placement.enrollmentNumber}</p>
                        </div>
                      </article>
                    ))}
                  {placedStudents.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-900 p-12 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                      No placed students yet.
                    </div>
                  )}
                </div>
              )}

              {peopleView === 'alumni' && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredAlumni.map((alumnus) => (
                    <article
                      key={alumnus.id}
                      className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold text-white">{alumnus.fullName}</p>
                          <p className="text-sm text-slate-400">{alumnus.designation || 'Alumni'}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
                          <Users className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <StatusChip label="ALUMNI" tone="emerald" />
                        <StatusChip label={`Batch ${alumnus.passingYear}`} tone="slate" />
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-slate-400">
                        <p>{alumnus.currentCompany || 'Company not added'}</p>
                        <p>{alumnus.email}</p>
                        <p>{alumnus.location || 'Location not added'}</p>
                      </div>
                    </article>
                  ))}
                  {filteredAlumni.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-900 p-12 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                      No alumni match your search.
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {activeTab === 'events' && (
            <section className="space-y-6">
              <div className="flex flex-col gap-4 rounded-3xl border border-slate-900/80 bg-slate-950/50 p-5 shadow-xl shadow-black/10 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
                <div className="grid w-full gap-3 md:max-w-3xl md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-900 bg-slate-900/35 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Search className="h-4.5 w-4.5 text-slate-500" />
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search events..."
                        className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-slate-900/35 px-4 py-3">
                    <select
                      value={eventStatusFilter}
                      onChange={(e) => setEventStatusFilter(e.target.value as EventStatusFilter)}
                      className="w-full bg-transparent text-sm text-slate-200 focus:outline-none"
                    >
                      <option value="ALL">All events</option>
                      <option value="PENDING">Pending review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-slate-900/35 px-4 py-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Visible</span>
                      <span className="text-slate-200">{filteredEvents.length}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCreateEventOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500"
                >
                  <Plus className="h-4 w-4" />
                  Create Event
                </button>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-900 p-16 text-center text-sm text-slate-500">
                  No events found.
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredEvents.map((event) => (
                    <article
                      key={event.id}
                      className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-white">{event.title}</h3>
                            <StatusChip
                              label={event.approvalStatus}
                              tone={
                                event.approvalStatus === 'APPROVED'
                                  ? 'emerald'
                                  : event.approvalStatus === 'REJECTED'
                                    ? 'rose'
                                    : 'amber'
                              }
                            />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{event.description}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <StatusChip label={event.category} tone="blue" />
                            <StatusChip label={event.mode} tone="slate" />
                            <StatusChip label={`Seats ${event.availableSeats}/${event.totalSeats}`} tone="violet" />
                          </div>
                        </div>

                        <div className="flex min-w-[180px] flex-col gap-2 rounded-2xl border border-slate-900 bg-slate-900/35 p-4 text-xs text-slate-400">
                          <p className="font-bold text-white">{event.speakerName}</p>
                          <p>{event.speakerDesignation || 'Speaker / Alumni host'}</p>
                          <p>{event.speakerCompany || 'AlumniConnect'}</p>
                          <p className="flex items-center gap-2">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {formatDate(event.eventDate)} at {event.eventTime}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock3 className="h-3.5 w-3.5" />
                            Deadline {formatDate(event.registrationDeadline)}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.venue}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-slate-500">
                          Created by{' '}
                          <span className="font-semibold text-slate-300">
                            {event.createdBy.role === 'ALUMNI'
                              ? event.createdBy.alumniProfile?.fullName || event.createdBy.email
                              : event.createdBy.cdcProfile?.collegeName || 'CDC'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => loadRegistrants(event)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-900 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-900"
                          >
                            Registrations
                            <BadgeCheck className="h-4 w-4 text-blue-400" />
                          </button>
                          {event.approvalStatus === 'PENDING' && (
                            <button
                              onClick={() => {
                                setEventRemarks(event.remarks || '');
                                setSelectedEvent(event);
                              }}
                              className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300 transition-all hover:bg-blue-500 hover:text-white"
                            >
                              Review
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'jobs' && (
            <section className="space-y-6">
              <div className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
                <div className="grid gap-4 lg:grid-cols-4">
                  <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-900/35 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Search className="h-4.5 w-4.5 text-slate-500" />
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search jobs..."
                        className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-slate-900/35 px-4 py-3">
                    <select
                      value={jobStatusFilter}
                      onChange={(e) => setJobStatusFilter(e.target.value as JobStatusFilter)}
                      className="w-full bg-transparent text-sm text-slate-200 focus:outline-none"
                    >
                      <option value="ALL">All jobs</option>
                      <option value="PENDING">Pending review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-slate-900/35 px-4 py-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Visible</span>
                      <span className="text-slate-200">{filteredJobs.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-900 p-16 text-center text-sm text-slate-500">
                  No jobs found.
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredJobs.map((job) => (
                    <article
                      key={job.id}
                      className="rounded-3xl border border-slate-900/80 bg-slate-950/50 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-white">{job.title}</h3>
                            <StatusChip
                              label={job.approvalStatus}
                              tone={
                                job.approvalStatus === 'APPROVED'
                                  ? 'emerald'
                                  : job.approvalStatus === 'REJECTED'
                                    ? 'rose'
                                    : 'amber'
                              }
                            />
                            <StatusChip label={job.jobType} tone="slate" />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{job.description}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {job.skillsRequired.slice(0, 4).map((skill) => (
                              <StatusChip key={skill} label={skill} tone="blue" />
                            ))}
                          </div>
                        </div>

                        <div className="flex min-w-[190px] flex-col gap-2 rounded-2xl border border-slate-900 bg-slate-900/35 p-4 text-xs text-slate-400">
                          <p className="font-bold text-white">{job.company}</p>
                          <p>{job.postedBy.role === 'ALUMNI' ? job.postedBy.alumniProfile?.fullName || job.postedBy.email : job.postedBy.cdcProfile?.collegeName || 'CDC'}</p>
                          <p>{job.location || 'Location not added'}</p>
                          <p>{job.salary || 'Salary not shared'}</p>
                          <p className="flex items-center gap-2">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {job.deadline ? formatDate(job.deadline) : 'No deadline'}
                          </p>
                          <p className="flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5" />
                            Applications {job._count.applications}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap justify-end gap-2">
                        {job.applicationLink && (
                          <a
                            href={job.applicationLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-900 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-900"
                          >
                            Open Link
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {job.approvalStatus === 'PENDING' && (
                          <button
                            onClick={() => {
                              setJobRemarks(job.remarks || '');
                              setSelectedJob(job);
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300 transition-all hover:bg-blue-500 hover:text-white"
                          >
                            Review
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedApplication(null)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedApplication.fullName}</h3>
                <p className="text-sm text-slate-400">
                  {selectedApplication.enrollmentNumber} • {selectedApplication.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-170px)] overflow-y-auto px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Profile</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    <p>Phone: {selectedApplication.phone || 'N/A'}</p>
                    <p>Course: {selectedApplication.currentCourse}</p>
                    <p>Branch: {selectedApplication.currentBranch}</p>
                    <p>Semester: {selectedApplication.currentSemester}</p>
                    <p>CGPA: {selectedApplication.currentCGPA}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Academic</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    <p>Primary domain: {selectedApplication.primaryDomain}</p>
                    <p>Secondary domain: {selectedApplication.secondaryDomain || 'N/A'}</p>
                    <p>Skills: {selectedApplication.skills?.length ? selectedApplication.skills.join(', ') : 'N/A'}</p>
                    <p>Submitted: {formatDateTime(selectedApplication.submittedAt)}</p>
                    <p>Verified: {formatDateTime(selectedApplication.verifiedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-900 bg-slate-900/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Resume</p>
                    <p className="mt-1 text-sm text-slate-300">Open the student resume before approving the profile.</p>
                  </div>
                  <a
                    href={selectedApplication.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                  >
                    Download
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {selectedApplication.certifications?.length > 0 && (
                <div className="mt-4 rounded-2xl border border-slate-900 bg-slate-900/30 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Certifications</p>
                  <div className="mt-3 space-y-2">
                    {selectedApplication.certifications.map((cert) => (
                      <div key={`${cert.name}-${cert.issueDate}`} className="rounded-2xl border border-slate-900 bg-slate-950/60 p-3 text-sm text-slate-300">
                        <p className="font-semibold text-white">{cert.name}</p>
                        <p className="text-slate-400">{cert.issuingOrganization}</p>
                        <a
                          href={cert.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 hover:text-blue-200"
                        >
                          View certificate
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-900 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <input
                value={applicationRemarks}
                onChange={(e) => setApplicationRemarks(e.target.value)}
                placeholder="Add CDC remarks before approving or rejecting"
                className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none md:max-w-md"
              />
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  disabled={applicationActionLoading}
                  onClick={() => handleApplicationDecision(selectedApplication.id, 'UNDER_VERIFICATION')}
                  className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-amber-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
                >
                  Under verification
                </button>
                <button
                  disabled={applicationActionLoading}
                  onClick={() => handleApplicationDecision(selectedApplication.id, 'REJECTED')}
                  className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500 hover:text-white disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  disabled={applicationActionLoading}
                  onClick={() => handleApplicationDecision(selectedApplication.id, 'APPROVED')}
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-white">Review event</h3>
                <p className="text-sm text-slate-400">Approve or reject the event before it reaches students.</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-4">
                <p className="text-lg font-bold text-white">{selectedEvent.title}</p>
                <p className="mt-1 text-sm text-slate-400">{selectedEvent.category} • {selectedEvent.mode}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{selectedEvent.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusChip label={selectedEvent.approvalStatus} tone={selectedEvent.approvalStatus === 'APPROVED' ? 'emerald' : selectedEvent.approvalStatus === 'REJECTED' ? 'rose' : 'amber'} />
                  <StatusChip label={`Seats ${selectedEvent.availableSeats}/${selectedEvent.totalSeats}`} tone="slate" />
                  <StatusChip label={selectedEvent.createdBy.role} tone="blue" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Speaker</p>
                  <p className="mt-1">{selectedEvent.speakerName}</p>
                  <p>{selectedEvent.speakerDesignation || 'N/A'}</p>
                  <p>{selectedEvent.speakerCompany || 'N/A'}</p>
                </div>
                <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Schedule</p>
                  <p className="mt-1">{formatDate(selectedEvent.eventDate)}</p>
                  <p>{selectedEvent.eventTime}</p>
                  <p>Deadline: {formatDate(selectedEvent.registrationDeadline)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-4">
                <input
                  value={eventRemarks}
                  onChange={(e) => setEventRemarks(e.target.value)}
                  placeholder="Add CDC remarks"
                  className="w-full rounded-2xl border border-slate-900 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-900 px-6 py-4">
              <button
                disabled={eventActionLoading}
                onClick={() => handleEventDecision(selectedEvent.id, 'REJECTED')}
                className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500 hover:text-white disabled:opacity-50"
              >
                Reject
              </button>
              <button
                disabled={eventActionLoading}
                onClick={() => handleEventDecision(selectedEvent.id, 'APPROVED')}
                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-white">Review job posting</h3>
                <p className="text-sm text-slate-400">Approve or reject alumni job posts.</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-4">
                <p className="text-lg font-bold text-white">{selectedJob.title}</p>
                <p className="mt-1 text-sm text-slate-400">{selectedJob.company} • {selectedJob.jobType}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{selectedJob.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusChip label={selectedJob.approvalStatus} tone={selectedJob.approvalStatus === 'APPROVED' ? 'emerald' : selectedJob.approvalStatus === 'REJECTED' ? 'rose' : 'amber'} />
                  <StatusChip label={`Applications ${selectedJob._count.applications}`} tone="slate" />
                  <StatusChip label={selectedJob.postedBy.role} tone="blue" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Creator</p>
                  <p className="mt-1">{selectedJob.postedBy.role === 'ALUMNI' ? selectedJob.postedBy.alumniProfile?.fullName || selectedJob.postedBy.email : selectedJob.postedBy.cdcProfile?.collegeName || 'CDC'}</p>
                  <p>{selectedJob.postedBy.email}</p>
                </div>
                <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Details</p>
                  <p className="mt-1">{selectedJob.location || 'Location not added'}</p>
                  <p>{selectedJob.salary || 'Salary not shared'}</p>
                  <p>{selectedJob.deadline ? formatDate(selectedJob.deadline) : 'No deadline'}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-4">
                <input
                  value={jobRemarks}
                  onChange={(e) => setJobRemarks(e.target.value)}
                  placeholder="Add CDC remarks"
                  className="w-full rounded-2xl border border-slate-900 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-900 px-6 py-4">
              <button
                disabled={jobActionLoading}
                onClick={() => handleJobDecision(selectedJob.id, 'REJECTED')}
                className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500 hover:text-white disabled:opacity-50"
              >
                Reject
              </button>
              <button
                disabled={jobActionLoading}
                onClick={() => handleJobDecision(selectedJob.id, 'APPROVED')}
                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {registrantsEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRegistrantsEvent(null)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-white">{registrantsEvent.title} Registrations</h3>
                <p className="text-sm text-slate-400">Total registrations: {registrants.length}</p>
              </div>
              <button
                onClick={() => setRegistrantsEvent(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-170px)] overflow-y-auto px-6 py-5">
              {registrantsLoading ? (
                <div className="flex min-h-[180px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                </div>
              ) : registrants.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-900 p-12 text-center text-sm text-slate-500">
                  No registrants found.
                </div>
              ) : (
                <div className="space-y-3">
                  {registrants.map((registration) => (
                    <div
                      key={registration.id}
                      className="rounded-2xl border border-slate-900 bg-slate-900/35 p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-bold text-white">
                            {registration.user.studentProfile?.fullName || 'N/A'}
                          </p>
                          <p className="text-sm text-slate-400">
                            {registration.user.studentProfile?.enrollmentNumber || 'N/A'} • {registration.user.email}
                          </p>
                        </div>
                        <StatusChip
                          label={registration.status}
                          tone={registration.status === 'ATTENDED' ? 'emerald' : registration.status === 'CANCELLED' ? 'rose' : 'blue'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-900 px-6 py-4">
              <button
                onClick={exportRegistrants}
                disabled={registrants.length === 0}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-900 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-900 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => setRegistrantsEvent(null)}
                className="rounded-2xl border border-slate-900 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {createEventOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCreateEventOpen(false)} />
          <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-white">Create event</h3>
                <p className="text-sm text-slate-400">
                  Fill the alumni host name and email only when the event should appear on that alumni portal.
                </p>
              </div>
              <button
                onClick={() => setCreateEventOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form id="cdc-create-event-form" onSubmit={handleCreateEvent} className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Title *</label>
                  <input
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Resume Building Bootcamp"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category *</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 focus:outline-none"
                  >
                    {eventCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={eventForm.description}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Describe the event, goals, and participation details..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Banner URL</label>
                  <input
                    value={eventForm.bannerUrl}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, bannerUrl: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Mode *</label>
                  <select
                    value={eventForm.mode}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, mode: e.target.value as any }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="ONLINE">ONLINE</option>
                    <option value="HYBRID">HYBRID</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Event Date *</label>
                  <input
                    required
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Time *</label>
                  <input
                    required
                    value={eventForm.eventTime}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, eventTime: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="11:00 AM - 1:00 PM"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Duration *</label>
                  <input
                    required
                    value={eventForm.duration}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, duration: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="2 hours"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Venue *</label>
                  <input
                    required
                    value={eventForm.venue}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, venue: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Seminar Hall / Google Meet"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Google Maps URL</label>
                  <input
                    value={eventForm.googleMapsLocation}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, googleMapsLocation: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Registration Deadline *</label>
                  <input
                    required
                    type="date"
                    value={eventForm.registrationDeadline}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, registrationDeadline: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Seats *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={eventForm.totalSeats}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, totalSeats: Number(e.target.value) }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Speaker / Host Name *</label>
                  <input
                    required
                    value={eventForm.speakerName}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, speakerName: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Guest speaker or alumni host"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Speaker Designation</label>
                  <input
                    value={eventForm.speakerDesignation}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, speakerDesignation: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Senior Engineer / Founder"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Speaker Company</label>
                  <input
                    value={eventForm.speakerCompany}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, speakerCompany: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Company / Organization"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Hosted Alumni Name</label>
                  <input
                    value={eventForm.hostedByAlumniName}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, hostedByAlumniName: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Leave blank for CDC-only event"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Hosted Alumni Email</label>
                  <input
                    value={eventForm.hostedByAlumniEmail}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, hostedByAlumniEmail: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="alumni@example.com"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Agenda</label>
                  <textarea
                    rows={3}
                    value={eventForm.agenda}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, agenda: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Agenda / schedule"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Benefits</label>
                  <textarea
                    rows={3}
                    value={eventForm.keyBenefits}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, keyBenefits: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Comma separated benefits"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Eligibility Criteria</label>
                  <textarea
                    rows={3}
                    value={eventForm.eligibilityCriteria}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, eligibilityCriteria: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Who can attend?"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Documents</label>
                  <textarea
                    rows={3}
                    value={eventForm.requiredDocuments}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, requiredDocuments: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-900 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="College ID Card, Resume, Registration form..."
                  />
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-2 border-t border-slate-900 px-6 py-4">
              <button
                onClick={() => setCreateEventOpen(false)}
                className="rounded-2xl border border-slate-900 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="cdc-create-event-form"
                disabled={creatingEvent}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 disabled:opacity-50"
              >
                {creatingEvent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create event
              </button>
            </div>
          </div>
        </div>
      )}

      {loadError && (
        <div className="fixed bottom-4 right-4 z-[70] max-w-sm rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 shadow-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-300" />
            <div>
              <p className="font-bold">CDC dashboard issue</p>
              <p className="mt-1 text-rose-100/80">{loadError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
