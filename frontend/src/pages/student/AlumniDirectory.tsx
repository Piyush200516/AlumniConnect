import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Bookmark, 
  SlidersHorizontal, 
  Loader2, 
  Grid, 
  List, 
  Users, 
  Building2, 
  Globe, 
  Rocket, 
  Sparkles, 
  MessageSquare,
  UserPlus,
  CheckCircle,
  X,
  Send,
  Eye
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { toastSuccess, toastError } from '../../utils/toast';

interface AlumniProfile {
  id: string;
  userId: string;
  fullName: string;
  passingYear: number;
  branch: string;
  course: string;
  currentCompany: string | null;
  companyLogo: string | null;
  designation: string | null;
  experience: number;
  location: string | null;
  skills: string[];
  bio: string | null;
  profileImageUrl: string | null;
  linkedinUrl: string | null;
  isVerified: boolean;
  isFollowing: boolean;
  isSaved: boolean;
  connectionState: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED' | 'REJECTED';
  connectionId: string | null;
}

interface AlumniDirectoryProps {
  onSelectAlumni: (alumniId: string) => void;
}

export default function AlumniDirectory({ onSelectAlumni }: AlumniDirectoryProps) {
  const queryClient = useQueryClient();

  // View States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedExperience, setSelectedExperience] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Messaging Modal State
  const [messageTarget, setMessageTarget] = useState<AlumniProfile | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Fetch Alumni List with filters
  const { data, isLoading } = useQuery({
    queryKey: [
      'alumniList',
      searchTerm,
      selectedBranch,
      selectedYear,
      selectedCompany,
      selectedRole,
      selectedExperience,
      selectedLocation,
      sortBy
    ],
    queryFn: async () => {
      const res = await api.get('/alumni', {
        params: {
          search: searchTerm || undefined,
          branch: selectedBranch !== 'ALL' ? selectedBranch : undefined,
          passingYear: selectedYear !== 'ALL' ? selectedYear : undefined,
          company: selectedCompany !== 'ALL' ? selectedCompany : undefined,
          role: selectedRole !== 'ALL' ? selectedRole : undefined,
          experience: selectedExperience !== 'ALL' ? selectedExperience : undefined,
          location: selectedLocation !== 'ALL' ? selectedLocation : undefined,
          sortBy
        }
      });
      return res.data.data;
    }
  });

  const alumniList: AlumniProfile[] = data?.alumni || [];
  const sidebarMetrics = data?.sidebarMetrics || {
    totalAlumni: 2458,
    alumniInTopCompanies: 856,
    countriesRepresented: 32,
    entrepreneurs: 120,
    averageExperience: 18,
    activeAlumni: 72
  };
  const topCompanies = data?.topCompanies || [];
  const recentlyJoined = data?.recentlyJoined || [];

  // Mutations
  const connectMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      const res = await api.post('/alumni/connections/send', { receiverId });
      return res.data;
    },
    onSuccess: (resData) => {
      toastSuccess(resData.message || 'Connection request sent!');
      queryClient.invalidateQueries({ queryKey: ['alumniList'] });
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to send connection request');
    }
  });

  const acceptMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const res = await api.patch('/alumni/connections/accept', { connectionId });
      return res.data;
    },
    onSuccess: () => {
      toastSuccess('Connection request accepted!');
      queryClient.invalidateQueries({ queryKey: ['alumniList'] });
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to accept connection request');
    }
  });



  const saveProfileMutation = useMutation({
    mutationFn: async (alumniId: string) => {
      const res = await api.post(`/alumni/${alumniId}/save`);
      return res.data;
    },
    onSuccess: (resData) => {
      toastSuccess(resData.message || 'Save status updated');
      queryClient.invalidateQueries({ queryKey: ['alumniList'] });
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update save status');
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTarget || !messageContent.trim()) return;

    setIsSendingMessage(true);
    try {
      await api.post('/alumni/messages', {
        receiverId: messageTarget.userId,
        content: messageContent.trim()
      });
      toastSuccess(`Message sent to ${messageTarget.fullName}!`);
      setMessageContent('');
      setMessageTarget(null);
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedBranch('ALL');
    setSelectedYear('ALL');
    setSelectedCompany('ALL');
    setSelectedRole('ALL');
    setSelectedExperience('ALL');
    setSelectedLocation('ALL');
    setSearchTerm('');
  };

  // Extract filter suggestions from data
  const filterOptions = useMemo(() => {
    const branches = new Set<string>();
    const years = new Set<string>();
    const companies = new Set<string>();
    const roles = new Set<string>();
    const locations = new Set<string>();

    alumniList.forEach(a => {
      if (a.branch) branches.add(a.branch);
      if (a.passingYear) years.add(a.passingYear.toString());
      if (a.currentCompany) companies.add(a.currentCompany);
      if (a.designation) roles.add(a.designation);
      if (a.location) locations.add(a.location);
    });

    return {
      branches: ['ALL', ...Array.from(branches)],
      years: ['ALL', ...Array.from(years)],
      companies: ['ALL', ...Array.from(companies)].slice(0, 10),
      roles: ['ALL', ...Array.from(roles)].slice(0, 10),
      locations: ['ALL', ...Array.from(locations)].slice(0, 10),
    };
  }, [alumniList]);

  return (
    <div className="grid gap-8 grid-cols-1 xl:grid-cols-12 items-start">
      
      {/* Left Column: Alumni Listings & Filters */}
      <div className="xl:col-span-8 space-y-6">
        
        {/* Module Title */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-white">Alumni Directory</h2>
          <p className="text-xs text-slate-400">Connect with {sidebarMetrics.totalAlumni}+ alumni from our college community</p>
        </div>

        {/* Filters & Search Card */}
        <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search alumni by name, company, role, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-850 rounded-xl text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/80 text-slate-200 transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase rounded-xl border cursor-pointer transition-all ${
                  showFilters 
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
                <option value="newest">Sort: Relevance</option>
                <option value="experience">Sort: Experience</option>
                <option value="graduation">Sort: Graduation Year</option>
                <option value="name">Sort: Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Expandable Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-slate-900/60 pt-4 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-6"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Passout Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900/50 border border-slate-850 rounded-xl text-xs text-slate-350 focus:outline-none"
                  >
                    <option value="ALL">All Years</option>
                    {filterOptions.years.filter(y => y !== 'ALL').map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Branch</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900/50 border border-slate-850 rounded-xl text-xs text-slate-350 focus:outline-none"
                  >
                    <option value="ALL">All Branches</option>
                    <option value="CSIT">CSIT</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900/50 border border-slate-850 rounded-xl text-xs text-slate-350 focus:outline-none"
                  >
                    <option value="ALL">All Companies</option>
                    {filterOptions.companies.filter(c => c !== 'ALL').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900/50 border border-slate-850 rounded-xl text-xs text-slate-350 focus:outline-none"
                  >
                    <option value="ALL">All Roles</option>
                    {filterOptions.roles.filter(r => r !== 'ALL').map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experience</label>
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900/50 border border-slate-850 rounded-xl text-xs text-slate-350 focus:outline-none"
                  >
                    <option value="ALL">All Exp</option>
                    <option value="1-2">1-2 Years</option>
                    <option value="3-5">3-5 Years</option>
                    <option value="5+">5+ Years</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900/50 border border-slate-850 rounded-xl text-xs text-slate-350 focus:outline-none"
                  >
                    <option value="ALL">All Locs</option>
                    {filterOptions.locations.filter(l => l !== 'ALL').map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom control tags & Toggle Grid */}
          <div className="flex items-center justify-between border-t border-slate-900/40 pt-3 flex-wrap gap-2">
            <button 
              onClick={handleClearFilters}
              className="text-xs font-semibold text-slate-500 hover:text-blue-400 transition-colors"
            >
              Clear All Filters
            </button>

            <div className="flex items-center gap-1.5 bg-slate-900/40 p-1 border border-slate-850 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Listings Result count */}
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Showing {isLoading ? '-' : alumniList.length} of {sidebarMetrics.totalAlumni} alumni
        </p>

        {/* Directory Listings Grid */}
        {isLoading ? (
          <div className="flex h-[40vh] flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-slate-500 text-xs font-semibold">Opening directory profiles...</p>
          </div>
        ) : alumniList.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-900 rounded-3xl p-6 bg-slate-950/10">
            <Users className="h-12 w-12 text-slate-800 mx-auto mb-4 animate-bounce" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Alumni Matches</h3>
            <p className="text-slate-550 text-xs mt-1 max-w-sm mx-auto">Try expanding filter conditions or updating search phrases.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Mode */
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {alumniList.map((alumni) => (
              <motion.div
                key={alumni.id}
                whileHover={{ y: -3 }}
                onClick={() => onSelectAlumni(alumni.id)}
                className="relative p-5 rounded-3xl border border-slate-900/60 bg-slate-950/30 hover:bg-slate-900/20 hover:border-slate-800/80 shadow-lg cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[360px]"
              >
                {/* Header: Photo, Name, Save bookmark */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      {alumni.profileImageUrl ? (
                        <img 
                          src={alumni.profileImageUrl} 
                          alt="" 
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-900 shadow-md shrink-0" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center font-bold text-lg text-white border border-blue-900/20 shrink-0">
                          {alumni.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-white text-sm hover:text-blue-400 transition-colors leading-tight flex items-center gap-1">
                          {alumni.fullName}
                          {alumni.isVerified && (
                            <CheckCircle className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10 shrink-0" />
                          )}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wide">
                          {alumni.course} {alumni.branch} • {alumni.passingYear}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveProfileMutation.mutate(alumni.id);
                      }}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all ${
                        alumni.isSaved 
                          ? 'bg-blue-600/10 border-blue-500/35 text-blue-405' 
                          : 'border-slate-900 bg-slate-900/40 text-slate-500 hover:text-slate-200'
                      }`}
                    >
                      <Bookmark className="h-3.5 w-3.5" fill={alumni.isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* designation / company details */}
                  <div className="space-y-2 border-t border-slate-900/30 pt-3">
                    <div>
                      <p className="text-xs font-bold text-white leading-normal truncate">{alumni.designation || 'Alumni Member'}</p>
                      <p className="text-[10px] text-slate-450 mt-0.5 truncate flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-slate-650" />
                        {alumni.currentCompany || 'TechMart Solutions'}
                      </p>
                    </div>

                    {/* Metadata indicators */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500">
                      <p className="flex items-center gap-1 truncate">
                        <Briefcase className="h-3 w-3 text-slate-600" />
                        {alumni.experience} Years Exp
                      </p>
                      {alumni.location && (
                        <p className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 text-slate-600" />
                          {alumni.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {alumni.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-0.5 bg-slate-900/60 border border-slate-900/80 rounded text-[9px] font-bold text-slate-400">
                        {skill}
                      </span>
                    ))}
                    {alumni.skills.length > 3 && (
                      <span className="text-[9px] font-bold text-slate-550 px-1 py-0.5">
                        +{alumni.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="border-t border-slate-900/40 pt-3.5 flex gap-2">
                  {/* Connect status triggers */}
                  {alumni.connectionState === 'CONNECTED' ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toastSuccess('You are connected! Start messaging.');
                      }}
                      className="flex-1 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-400 cursor-default flex items-center justify-center gap-1.5"
                    >
                      ✓ Connected
                    </button>
                  ) : alumni.connectionState === 'PENDING_SENT' ? (
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-2 bg-slate-900 border border-slate-900 rounded-xl text-xs font-bold text-amber-500/80 cursor-default"
                    >
                      Requested
                    </button>
                  ) : alumni.connectionState === 'PENDING_RECEIVED' && alumni.connectionId ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptMutation.mutate(alumni.connectionId!);
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      Accept
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        connectMutation.mutate(alumni.userId);
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Connect
                    </button>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMessageTarget(alumni);
                    }}
                    className="px-3 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-350 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List View Mode */
          <div className="space-y-4">
            {alumniList.map((alumni) => (
              <motion.div
                key={alumni.id}
                whileHover={{ x: 2 }}
                onClick={() => onSelectAlumni(alumni.id)}
                className="p-4 rounded-2xl border border-slate-900 bg-slate-950/30 hover:bg-slate-900/10 cursor-pointer shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {alumni.profileImageUrl ? (
                    <img 
                      src={alumni.profileImageUrl} 
                      alt="" 
                      className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-900" 
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-base text-slate-400 shrink-0 border border-slate-850">
                      {alumni.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm flex items-center gap-1">
                      {alumni.fullName}
                      {alumni.isVerified && <CheckCircle className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10 shrink-0" />}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {alumni.course} {alumni.branch} • {alumni.passingYear} • {alumni.designation || 'Alumni Member'} at {alumni.currentCompany || 'TechMart'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAlumni(alumni.id);
                    }}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-xl text-[11px] font-bold text-slate-350 cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Profile
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMessageTarget(alumni);
                    }}
                    className="p-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-xl text-slate-400 cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Sidebar Analytics & Suggestions */}
      <div className="xl:col-span-4 space-y-8">
        
        {/* Analytics Overview Widget */}
        <div className="rounded-3xl border border-slate-900 bg-slate-950/40 p-5 backdrop-blur-xl space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">All Alumni</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-900/15 border border-slate-900/80 rounded-2xl flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Alumni</p>
                <p className="text-base font-black text-white">{sidebarMetrics.totalAlumni}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/15 border border-slate-900/80 rounded-2xl flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">In Top Cos</p>
                <p className="text-base font-black text-emerald-400">{sidebarMetrics.alumniInTopCompanies}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/15 border border-slate-900/80 rounded-2xl flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Globe className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Countries</p>
                <p className="text-base font-black text-purple-400">{sidebarMetrics.countriesRepresented}+</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/15 border border-slate-900/80 rounded-2xl flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-amber-600/10 border border-amber-500/20 text-amber-450 flex items-center justify-center shrink-0">
                <Rocket className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Entrepreneurs</p>
                <p className="text-base font-black text-amber-400">{sidebarMetrics.entrepreneurs}+</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/15 border border-slate-900/80 rounded-2xl flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-750 text-slate-300 flex items-center justify-center shrink-0">
                <Briefcase className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Avg. Experience</p>
                <p className="text-base font-black text-white">{sidebarMetrics.averageExperience} Yrs</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/15 border border-slate-900/80 rounded-2xl flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-pink-600/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Active Rate</p>
                <p className="text-base font-black text-pink-450">{sidebarMetrics.activeAlumni}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Companies Widget */}
        <div className="rounded-3xl border border-slate-900 bg-slate-950/40 p-5 backdrop-blur-xl space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Top Companies</h3>
          
          <div className="space-y-3">
            {topCompanies.map((c: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="text-slate-200">{c.company}</span>
                <span className="text-[10px] bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-500 font-bold">{c.count} Alumni</span>
              </div>
            ))}
            {topCompanies.length === 0 && (
              <p className="text-xs text-slate-500 italic py-2 text-center">No company listings available.</p>
            )}
          </div>
        </div>

        {/* Recently Joined Alumni */}
        <div className="rounded-3xl border border-slate-900 bg-slate-950/40 p-5 backdrop-blur-xl space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Recently Joined Alumni</h3>
          
          <div className="space-y-4">
            {recentlyJoined.map((alumni: any, index: number) => (
              <div 
                key={index} 
                onClick={() => onSelectAlumni(alumni.id)}
                className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/15 border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer"
              >
                {alumni.profileImageUrl ? (
                  <img src={alumni.profileImageUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-800" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-[11px] text-slate-400 border border-slate-800 shrink-0">
                    {alumni.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-white text-xs truncate">{alumni.fullName}</p>
                  <p className="text-[9px] text-slate-500 truncate mt-0.5">{alumni.designation} at {alumni.currentCompany}</p>
                </div>
              </div>
            ))}
            {recentlyJoined.length === 0 && (
              <p className="text-xs text-slate-500 italic py-2 text-center">No recent records available.</p>
            )}
          </div>
        </div>

      </div>

      {/* QUICK SEND MESSAGE DIALOG */}
      {messageTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setMessageTarget(null)}></div>
          <div className="relative w-full max-w-md rounded-2xl border border-slate-850 bg-slate-950 p-6 shadow-2xl text-slate-200 z-10 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">Send Direct Message</h3>
                <p className="text-[10px] text-slate-400">To: {messageTarget.fullName} • {messageTarget.designation}</p>
              </div>
              <button 
                onClick={() => setMessageTarget(null)}
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
                  placeholder="Enter your query or request description..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 leading-relaxed placeholder-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                <button 
                  type="button" 
                  onClick={() => setMessageTarget(null)}
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
