import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Calendar as CalendarIcon, 
  Users, 
  MessageSquare,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

// Reusable Components
import Sidebar from '../../components/dashboard/Sidebar';
import Navbar from '../../components/dashboard/Navbar';
import StatCard from '../../components/dashboard/StatCard';
import EventCard from '../../components/dashboard/EventCard';
import JobCard from '../../components/dashboard/JobCard';
import MentorCard from '../../components/dashboard/MentorCard';
import AnnouncementCard from '../../components/dashboard/AnnouncementCard';
import Profile from './Profile';
import SettingsView from '../../components/dashboard/SettingsView';
import { useAuthContext } from '../../components/layout/AuthProvider';

// TypeScript Interfaces for Mock Data
interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: 'Internship' | 'Full-time' | 'Contract';
  postedTime: string;
  logoUrl: string;
}

interface EventItem {
  id: string;
  title: string;
  organizer: string;
  date: string;
  time: string;
  imageUrl: string;
  location: string;
}

interface Mentor {
  id: string;
  name: string;
  designation: string;
  company: string;
  expertise: string;
  avatarUrl: string;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  statusColor: 'green' | 'purple' | 'orange' | 'blue';
}

export default function StudentDashboard() {
  const { profile, loading: authLoading, logout, refreshProfile } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [loading, setLoading] = useState(true);

  // Mock data matching the screenshot specifications
  const jobs: Job[] = [
    {
      id: '1',
      title: 'Software Engineer Intern',
      companyName: 'Google',
      location: 'Bengaluru, India',
      jobType: 'Internship',
      postedTime: '2d ago',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
    },
    {
      id: '2',
      title: 'Frontend Developer',
      companyName: 'Microsoft',
      location: 'Remote',
      jobType: 'Full-time',
      postedTime: '3d ago',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/732/732221.png',
    },
    {
      id: '3',
      title: 'Associate Software Engineer',
      companyName: 'ZS Associates',
      location: 'Pune, India',
      jobType: 'Full-time',
      postedTime: '5d ago',
      logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=ZS&backgroundColor=0d1e3a',
    },
  ];

  const events: EventItem[] = [
    {
      id: '1',
      title: 'Alumni Talk: Career in Software Engineering',
      organizer: 'By AlumniConnect',
      date: '25 May 2025',
      time: '10:00 AM',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&auto=format&fit=crop&q=80',
      location: 'Online',
    },
    {
      id: '2',
      title: 'Tech Meet 2025',
      organizer: 'CSE Department',
      date: '30 May 2025',
      time: '02:00 PM',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&auto=format&fit=crop&q=80',
      location: 'CSE Block Seminar Hall',
    },
    {
      id: '3',
      title: 'Networking Night with Alumni',
      organizer: 'Main Auditorium',
      date: '05 Jun 2025',
      time: '06:00 PM',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=150&auto=format&fit=crop&q=80',
      location: 'Campus Amphitheater',
    },
  ];

  const mentors: Mentor[] = [
    {
      id: '1',
      name: 'Rahul Sharma',
      designation: 'SDE II',
      company: 'Amazon',
      expertise: 'DSA, System Design, Interviews',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      name: 'Ananya Verma',
      designation: 'Product Manager',
      company: 'Microsoft',
      expertise: 'Product Management, Career Growth',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'AlumniConnect Summer Internship Drive 2025',
      description: 'Applications open for summer internships. Don\'t miss out!',
      timestamp: '2d ago',
      statusColor: 'green',
    },
    {
      id: '2',
      title: 'Hackathon 2025 Registration Open',
      description: 'Form your team and register for the biggest hackathon on campus.',
      timestamp: '5d ago',
      statusColor: 'purple',
    },
    {
      id: '3',
      title: 'Alumni Webinar: Higher Studies Abroad',
      description: 'Join us for an insightful session on study opportunities in Europe & USA.',
      timestamp: '1w ago',
      statusColor: 'orange',
    },
  ];

  // Sync loading state with authLoading and profile availability
  useEffect(() => {
    if (authLoading || !profile) {
      setLoading(true);
      return;
    }
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [authLoading, profile]);
 
   const handleRefresh = async () => {
     setLoading(true);
     await refreshProfile();
     setTimeout(() => setLoading(false), 600);
   };
 
   const handleLogout = () => {
     console.log('Logging out student...');
     logout();
   };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060a12] via-[#09101f] to-[#04070e] text-slate-100 antialiased font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        activeItem={activeMenu}
        onSelect={(item) => {
          if (item === 'Logout') {
            handleLogout();
          } else {
            setActiveMenu(item);
          }
        }}
      />

      {/* Main Panel */}
      <div className="flex flex-col min-h-screen lg:pl-[280px]">
        {/* Top Navbar */}
        <Navbar 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          onLogout={handleLogout}
          onProfileClick={() => setActiveMenu('Profile')}
          onSettingsClick={() => setActiveMenu('Settings')}
        />

        {/* Content Wrapper */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Header Hero Section */}
          {activeMenu !== 'Profile' && activeMenu !== 'Settings' && (
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
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
                Refresh Feed
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {loading ? (
              // SKELETON LOADER STATE
              <motion.div 
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Stats Cards Skeleton */}
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-[98px] rounded-2xl border border-slate-900 bg-slate-900/10 p-6 animate-pulse flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-xl bg-slate-850" />
                        <div className="space-y-2">
                          <div className="h-5 w-8 bg-slate-800 rounded" />
                          <div className="h-3.5 w-24 bg-slate-800 rounded" />
                        </div>
                      </div>
                      <div className="h-3 w-12 bg-slate-850 rounded" />
                    </div>
                  ))}
                </div>

                {/* Content Grid Skeleton */}
                <div className="grid gap-8 grid-cols-1 xl:grid-cols-12">
                  {/* Left Column Skeleton */}
                  <div className="xl:col-span-7 space-y-8">
                    {/* Events Skeleton */}
                    <div className="rounded-2xl border border-slate-900 bg-slate-900/15 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-5 w-36 bg-slate-800 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-slate-800 rounded animate-pulse" />
                      </div>
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-20 rounded-xl border border-slate-900 bg-slate-900/10 p-4 animate-pulse flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-slate-850 shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-3/4 bg-slate-850 rounded" />
                              <div className="h-3 w-1/2 bg-slate-850 rounded" />
                            </div>
                            <div className="h-6 w-16 bg-slate-850 rounded shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mentors Skeleton */}
                    <div className="rounded-2xl border border-slate-900 bg-slate-900/15 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-5 w-36 bg-slate-800 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-slate-800 rounded animate-pulse" />
                      </div>
                      <div className="space-y-3">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="h-20 rounded-xl border border-slate-900 bg-slate-900/10 p-4 animate-pulse flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-850 shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-1/3 bg-slate-850 rounded" />
                              <div className="h-3 w-1/2 bg-slate-850 rounded" />
                            </div>
                            <div className="h-8 w-20 bg-slate-850 rounded shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column Skeleton */}
                  <div className="xl:col-span-5 space-y-8">
                    {/* Jobs Skeleton */}
                    <div className="rounded-2xl border border-slate-900 bg-slate-900/15 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-5 w-48 bg-slate-800 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-slate-800 rounded animate-pulse" />
                      </div>
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
                    </div>

                    {/* Announcements Skeleton */}
                    <div className="rounded-2xl border border-slate-900 bg-slate-900/15 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-slate-800 rounded animate-pulse" />
                      </div>
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 rounded-xl border border-slate-900 bg-slate-900/10 p-4 animate-pulse flex gap-3">
                            <div className="h-2.5 w-2.5 rounded-full bg-slate-800 shrink-0 mt-1.5" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3.5 w-3/4 bg-slate-850 rounded" />
                              <div className="h-2.5 w-1/2 bg-slate-850 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeMenu === 'Profile' ? (
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
                    count={12} 
                    icon={Briefcase} 
                    colorScheme="blue"
                    onViewAllClick={() => setActiveMenu('Job Opportunities')}
                  />
                  <StatCard 
                    title="Upcoming Events" 
                    count={5} 
                    icon={CalendarIcon} 
                    colorScheme="green"
                    onViewAllClick={() => setActiveMenu('Events')}
                  />
                  <StatCard 
                    title="Mentorship Offers" 
                    count={8} 
                    icon={Users} 
                    colorScheme="purple"
                    onViewAllClick={() => setActiveMenu('Mentorship')}
                  />
                  <StatCard 
                    title="Unread Messages" 
                    count={5} 
                    icon={MessageSquare} 
                    colorScheme="orange"
                    onViewAllClick={() => setActiveMenu('Messages')}
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
                          onClick={() => setActiveMenu('Events')}
                          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          View all
                        </button>
                      </div>
                      
                      <div className="flex flex-col gap-3.5">
                        {events.map((event) => (
                          <EventCard
                            key={event.id}
                            title={event.title}
                            organizer={event.organizer}
                            date={event.date}
                            time={event.time}
                            imageUrl={event.imageUrl}
                            location={event.location}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Mentorship Offers Section */}
                    <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-6 backdrop-blur-xl space-y-5 shadow-xl shadow-black/10">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white tracking-tight">
                          Mentorship Offers
                        </h2>
                        <button 
                          onClick={() => setActiveMenu('Mentorship')}
                          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          View all
                        </button>
                      </div>

                      <div className="flex flex-col gap-3.5">
                        {mentors.map((mentor) => (
                          <MentorCard
                            key={mentor.id}
                            name={mentor.name}
                            designation={mentor.designation}
                            company={mentor.company}
                            expertise={mentor.expertise}
                            avatarUrl={mentor.avatarUrl}
                          />
                        ))}
                      </div>
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
                          onClick={() => setActiveMenu('Job Opportunities')}
                          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          View all
                        </button>
                      </div>

                      <div className="flex flex-col gap-3.5">
                        {jobs.map((job) => (
                          <JobCard
                            key={job.id}
                            title={job.title}
                            companyName={job.companyName}
                            location={job.location}
                            jobType={job.jobType}
                            postedTime={job.postedTime}
                            logoUrl={job.logoUrl}
                          />
                        ))}
                      </div>

                      <button 
                        onClick={() => setActiveMenu('Job Opportunities')}
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
                        <button 
                          onClick={() => setActiveMenu('Notifications')}
                          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          View all
                        </button>
                      </div>

                      <div className="flex flex-col gap-3.5">
                        {announcements.map((announcement) => (
                          <AnnouncementCard
                            key={announcement.id}
                            title={announcement.title}
                            description={announcement.description}
                            timestamp={announcement.timestamp}
                            statusColor={announcement.statusColor}
                          />
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
