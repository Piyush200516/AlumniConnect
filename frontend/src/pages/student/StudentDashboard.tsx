import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Calendar as CalendarIcon, 
  Users, 
  MessageSquare,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuthContext } from '../../components/layout/AuthProvider';

// Reusable Core Components (loaded immediately)
import Sidebar from '../../components/dashboard/Sidebar';
import Navbar from '../../components/dashboard/Navbar';
import StatCard from '../../components/dashboard/StatCard';

// Lazy-loaded Views (Code-splitting)
const Profile = lazy(() => import('./Profile'));
const SettingsView = lazy(() => import('../../components/dashboard/SettingsView'));
const MyApplications = lazy(() => import('../../components/dashboard/MyApplications'));
const EventsPage = lazy(() => import('./EventsPage'));
const EventDetails = lazy(() => import('./EventDetails'));
const CertificateViewer = lazy(() => import('./CertificateViewer'));
const JobsPage = lazy(() => import('./JobsPage'));
const JobDetails = lazy(() => import('./JobDetails'));
const AlumniDirectory = lazy(() => import('./AlumniDirectory'));
const AlumniProfileView = lazy(() => import('./AlumniProfileView'));
const Mentorship = lazy(() => import('./Mentorship'));

// Lazy-loaded Dashboard Widget Sections
const EventsSection = lazy(() => import('../../components/dashboard/lazy/EventsSection'));
const JobsSection = lazy(() => import('../../components/dashboard/lazy/JobsSection'));
const MentorshipSection = lazy(() => import('../../components/dashboard/lazy/MentorshipSection'));
const NotificationsSection = lazy(() => import('../../components/dashboard/lazy/NotificationsSection'));
const MessagesSection = lazy(() => import('../../components/dashboard/lazy/MessagesSection'));

const ViewLoadingFallback = () => (
  <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    <p className="text-slate-400 text-xs font-semibold">Loading content...</p>
  </div>
);

const SectionLoadingFallback = () => (
  <div className="space-y-3 p-4">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="h-16 rounded-xl bg-slate-900/10 border border-slate-900 animate-pulse" />
    ))}
  </div>
);

export default function StudentDashboard() {
  const { profile, logout } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobAction, setSelectedJobAction] = useState<'view' | 'apply'>('view');
  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null);
  const [preselectedPartnerId, setPreselectedPartnerId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Performance log monitor: start fetching dashboard
  const fetchDashboardData = useCallback(async () => {
    console.time('fetch-dashboard-data');
    const res = await api.get('/student/dashboard');
    console.timeEnd('fetch-dashboard-data');
    return res.data.data;
  }, []);

  // React Query fetch hook with 5 minutes cache / stale values
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // Stale time of 5 minutes
    gcTime: 10 * 60 * 1000,   // Cache time of 10 minutes
  });

  // Sync profile details if API returns updated profile information
  useEffect(() => {
    if (data?.profileSummary) {
      // Invaliding query cache ensures consistency
      console.log('Dashboard profile summary fetched successfully.');
    }
  }, [data]);

  // Memoized stats data mapped directly from react-query state
  const stats = useMemo(() => {
    if (!data) {
      return { jobsCount: 0, eventsCount: 0, mentorsCount: 0, unreadMessagesCount: 0 };
    }
    return data.dashboardStats;
  }, [data]);

  const handleRefresh = useCallback(async () => {
    console.log('Invaliding queries and refetching dashboard...');
    queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    await refetch();
  }, [queryClient, refetch]);

  const handleLogout = useCallback(() => {
    console.log('Clearing query client and logging out student...');
    queryClient.clear();
    logout();
  }, [queryClient, logout]);

  // Memoized routing click handlers to prevent child component re-renders
  const handleSelectEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
    setActiveMenu('EventDetails');
  }, []);

  const handleViewCertificate = useCallback((certId: string) => {
    setSelectedCertificateId(certId);
    setActiveMenu('CertificateViewer');
  }, []);

  const handleGoBackToEvents = useCallback(() => {
    setActiveMenu('Events');
  }, []);

  const handleSelectJob = useCallback((jobId: string) => {
    setSelectedJobId(jobId);
    setSelectedJobAction('view');
    setActiveMenu('JobDetails');
  }, []);

  const handleApplyJob = useCallback((jobId: string) => {
    setSelectedJobId(jobId);
    setSelectedJobAction('apply');
    setActiveMenu('JobDetails');
  }, []);

  const handleGoBackToJobs = useCallback(() => {
    setActiveMenu('Job Opportunities');
  }, []);

  const handleSelectAlumni = useCallback((alumniId: string) => {
    setSelectedAlumniId(alumniId);
    setActiveMenu('AlumniProfileDetails');
  }, []);

  const handleGoBackToDirectory = useCallback(() => {
    setActiveMenu('Alumni Directory');
  }, []);

  // Sidebar / Navbar handlers
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleSelectSidebarItem = useCallback((item: string) => {
    if (item === 'Logout') {
      handleLogout();
    } else {
      setActiveMenu(item);
      if (item !== 'Messages') {
        setPreselectedPartnerId(null);
      }
    }
  }, [handleLogout]);
  const handleToggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const handleProfileClick = useCallback(() => setActiveMenu('Profile'), []);
  const handleSettingsClick = useCallback(() => setActiveMenu('Settings'), []);

  // Dashboard navigation handlers
  const handleGoToJobs = useCallback(() => setActiveMenu('Job Opportunities'), []);
  const handleGoToEvents = useCallback(() => setActiveMenu('Events'), []);
  const handleGoToMentorship = useCallback(() => setActiveMenu('Mentorship'), []);
  const handleGoToMessages = useCallback(() => setActiveMenu('Messages'), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060a12] via-[#09101f] to-[#04070e] text-slate-100 antialiased font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleCloseSidebar} 
        activeItem={activeMenu}
        onSelect={handleSelectSidebarItem}
      />

      {/* Main Panel */}
      <div className="flex flex-col min-h-screen lg:pl-[280px]">
        {/* Top Navbar */}
        <Navbar 
          onMenuToggle={handleToggleSidebar} 
          onLogout={handleLogout}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
        />

        {/* Content Wrapper */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Header Hero Section */}
          {activeMenu !== 'Profile' && activeMenu !== 'Settings' && activeMenu !== 'My Applications' && activeMenu !== 'Events' && activeMenu !== 'EventDetails' && activeMenu !== 'CertificateViewer' && activeMenu !== 'Messages' && activeMenu !== 'Alumni Directory' && activeMenu !== 'AlumniProfileDetails' && activeMenu !== 'Mentorship' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white">
                    Welcome back, {profile?.fullName || 'Student'}! 👋
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                    <Sparkles className="h-3 w-3" /> Pro Student
                  </span>
                </div>
                <p className="text-slate-400 text-sm font-medium">
                  Here's what's happening in your alumni community.
                </p>
              </div>

              {/* Refresh / Action buttons */}
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-850 cursor-pointer transition-all duration-300 self-start sm:self-center"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-blue-400' : ''}`} />
                Refresh Feed
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <Suspense fallback={<ViewLoadingFallback />}>
              {activeMenu === 'Profile' ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <Profile />
                </motion.div>
              ) : activeMenu === 'Settings' ? (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <SettingsView />
                </motion.div>
              ) : activeMenu === 'My Applications' ? (
                <motion.div
                  key="my-applications"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <MyApplications />
                </motion.div>
              ) : activeMenu === 'Events' ? (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <EventsPage 
                    onSelectEvent={handleSelectEvent}
                    onViewCertificate={handleViewCertificate}
                  />
                </motion.div>
              ) : activeMenu === 'Job Opportunities' ? (
                <motion.div
                  key="jobs-page"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <JobsPage onSelectJob={handleSelectJob} onApplyJob={handleApplyJob} />
                </motion.div>
              ) : activeMenu === 'Alumni Directory' ? (
                <motion.div
                  key="alumni-directory"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <AlumniDirectory 
                    onSelectAlumni={handleSelectAlumni} 
                    onNavigate={(tab, partnerId) => {
                      if (partnerId) setPreselectedPartnerId(partnerId);
                      setActiveMenu(tab);
                    }}
                  />
                </motion.div>
              ) : activeMenu === 'AlumniProfileDetails' && selectedAlumniId ? (
                <motion.div
                  key="alumni-profile-details"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <AlumniProfileView 
                    alumniId={selectedAlumniId} 
                    onGoBack={handleGoBackToDirectory} 
                    onNavigate={(tab, partnerId) => {
                      if (partnerId) setPreselectedPartnerId(partnerId);
                      setActiveMenu(tab);
                    }}
                  />
                </motion.div>
              ) : activeMenu === 'JobDetails' && selectedJobId ? (
                <motion.div
                  key="job-details"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <JobDetails
                    jobId={selectedJobId}
                    onGoBack={handleGoBackToJobs}
                    autoOpenApplyModal={selectedJobAction === 'apply'}
                  />
                </motion.div>
              ) : activeMenu === 'EventDetails' && selectedEventId ? (
                <motion.div
                  key="event-details"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <EventDetails 
                    eventId={selectedEventId}
                    onGoBack={handleGoBackToEvents}
                  />
                </motion.div>
              ) : activeMenu === 'CertificateViewer' && selectedCertificateId ? (
                <motion.div
                  key="certificate-viewer"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <CertificateViewer 
                    certificateId={selectedCertificateId}
                    onGoBack={handleGoBackToEvents}
                  />
                </motion.div>
              ) : activeMenu === 'Mentorship' ? (
                <motion.div
                  key="mentorship"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <Mentorship />
                </motion.div>
              ) : activeMenu === 'Messages' ? (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <MessagesSection 
                    preselectedPartnerId={preselectedPartnerId}
                    clearPreselected={() => setPreselectedPartnerId(null)}
                  />
                </motion.div>
              ) : (
                // FULLY LOADED DASHBOARD
                <motion.div
                  key="loaded-dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="space-y-8"
                >
                  {/* Stats Cards Section */}
                  <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard 
                      title="Job Opportunities" 
                      count={isLoading ? '-' : stats.jobsCount} 
                      icon={Briefcase} 
                      colorScheme="blue"
                      onViewAllClick={handleGoToJobs}
                    />
                    <StatCard 
                      title="Upcoming Events" 
                      count={isLoading ? '-' : stats.eventsCount} 
                      icon={CalendarIcon} 
                      colorScheme="green"
                      onViewAllClick={handleGoToEvents}
                    />
                    <StatCard 
                      title="Mentorship Offers" 
                      count={isLoading ? '-' : stats.mentorsCount} 
                      icon={Users} 
                      colorScheme="purple"
                      onViewAllClick={handleGoToMentorship}
                    />
                    <StatCard 
                      title="Unread Messages" 
                      count={isLoading ? '-' : stats.unreadMessagesCount} 
                      icon={MessageSquare} 
                      colorScheme="orange"
                      onViewAllClick={handleGoToMessages}
                    />
                  </div>

                  {/* Main Content Sections Grid */}
                  <div className="grid gap-8 grid-cols-1 xl:grid-cols-12">
                    
                    {/* Left Column (Events, Mentors) */}
                    <div className="xl:col-span-7 flex flex-col gap-8">
                      
                      {/* Upcoming Events Section */}
                      <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-6 backdrop-blur-xl space-y-5 shadow-xl shadow-black/10">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            Upcoming Events
                          </h2>
                          <button 
                            onClick={handleGoToEvents}
                            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                          >
                            View all
                          </button>
                        </div>
                        
                        <Suspense fallback={<SectionLoadingFallback />}>
                          <EventsSection 
                            events={data?.upcomingEvents || []} 
                            loading={isLoading} 
                          />
                        </Suspense>
                      </div>

                      {/* Mentorship Offers Section */}
                      <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-6 backdrop-blur-xl space-y-5 shadow-xl shadow-black/10">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            Mentorship Offers
                          </h2>
                          <button 
                            onClick={handleGoToMentorship}
                            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                          >
                            View all
                          </button>
                        </div>

                        <Suspense fallback={<SectionLoadingFallback />}>
                          <MentorshipSection 
                            mentors={data?.suggestedMentors || []} 
                            loading={isLoading} 
                          />
                        </Suspense>
                      </div>

                    </div>

                    {/* Right Column (Job Opportunities, Announcements) */}
                    <div className="xl:col-span-5 flex flex-col gap-8">
                      
                      {/* Job Opportunities Section */}
                      <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-6 backdrop-blur-xl space-y-5 shadow-xl shadow-black/10">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            Recent Job Opportunities
                          </h2>
                          <button 
                            onClick={handleGoToJobs}
                            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                          >
                            View all
                          </button>
                        </div>

                        <Suspense fallback={<SectionLoadingFallback />}>
                          <JobsSection 
                            jobs={data?.recentJobs || []} 
                            loading={isLoading} 
                          />
                        </Suspense>

                        <button 
                          onClick={handleGoToJobs}
                          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-900 bg-slate-900/20 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-slate-900/40 hover:border-slate-800 transition-all duration-300 group cursor-pointer"
                        >
                          <span>View all opportunities</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                      </div>

                      {/* Announcements Section */}
                      <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-6 backdrop-blur-xl space-y-5 shadow-xl shadow-black/10">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            Announcements
                          </h2>
                        </div>

                        <Suspense fallback={<SectionLoadingFallback />}>
                          <NotificationsSection 
                            notifications={data?.recentNotifications || []} 
                            loading={isLoading} 
                          />
                        </Suspense>
                      </div>

                    </div>

                  </div>
                </motion.div>
              )}
            </Suspense>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
