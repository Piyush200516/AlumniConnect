import {
  LayoutDashboard,
  User,
  Calendar,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  X,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../layout/AuthProvider';

interface AlumniSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: string;
  onSelect: (item: string) => void;
}

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Events', icon: Calendar },
  { name: 'Jobs', icon: Briefcase },
  { name: 'Post Job', icon: Briefcase },
  { name: 'Mentorship', icon: Users },
  { name: 'Messages', icon: MessageSquare },
  { name: 'Profile', icon: User },
  { name: 'Settings', icon: Settings },
];

export default function AlumniSidebar({ isOpen, onClose, activeItem, onSelect }: AlumniSidebarProps) {
  const { alumniProfile, alumniCompletionPercentage, loading } = useAuthContext();

  const handleSelect = (item: string) => {
    onSelect(item);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-800/80 bg-slate-950/95 p-6 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:bg-slate-950/40 lg:backdrop-blur-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/alumni/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-wide">
              AlumniConnect
            </span>
          </Link>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 text-slate-400 hover:text-white transition-all lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeItem.toLowerCase() === item.name.toLowerCase() ||
              (activeItem === 'Dashboard' && item.name === 'Events');

            return (
              <button
                key={item.name}
                onClick={() => handleSelect(item.name)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-lg shadow-blue-600/15 font-semibold'
                    : 'hover:bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
              </button>
            );
          })}

          <button
            onClick={() => handleSelect('Logout')}
            className="w-full flex items-center gap-3.5 px-4 py-3 mt-4 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 border border-transparent hover:border-rose-900/20 transition-all duration-300 group"
          >
            <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
            <span>Logout</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800/80">
          {loading || !alumniProfile ? (
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-3.5 p-2 bg-slate-900/40 border border-slate-900 rounded-xl">
                <div className="h-11 w-11 rounded-xl bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="px-2 space-y-2">
                <div className="h-3.5 w-28 bg-slate-800 rounded animate-pulse" />
                <div className="h-2 w-full bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3.5 mb-4 p-2 rounded-xl bg-slate-900/40 border border-slate-900">
                {alumniProfile.profileImageUrl ? (
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-800 shrink-0">
                    <img src={alumniProfile.profileImageUrl} alt={alumniProfile.fullName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-md shadow-blue-500/10 shrink-0">
                    {alumniProfile.fullName ? alumniProfile.fullName.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 justify-between">
                    <span className="font-semibold text-white text-sm truncate">{alumniProfile.fullName}</span>
                    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-400 border border-blue-500/20 shrink-0">
                      Alumni
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {alumniProfile.designation || 'Alumni'} {alumniProfile.currentCompany ? `• ${alumniProfile.currentCompany}` : ''}
                  </p>
                </div>
              </div>

              <div className="px-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
                  <span>Profile Completeness</span>
                  <span className="text-blue-400 font-semibold">{alumniCompletionPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-850 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${alumniCompletionPercentage}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
