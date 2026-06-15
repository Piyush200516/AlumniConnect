import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Calendar, 
  Briefcase, 
  Users, 
  UserSquare2, 
  MessageSquare, 
  Bookmark, 
  Bell, 
  Settings, 
  LogOut, 
  X,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onSelect?: (item: string) => void;
}

export default function Sidebar({ isOpen, onClose, activeItem = 'Dashboard', onSelect }: SidebarProps) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Profile', icon: User },
    { name: 'My Applications', icon: FileText },
    { name: 'Events', icon: Calendar },
    { name: 'Job Opportunities', icon: Briefcase },
    { name: 'Mentorship', icon: Users },
    { name: 'Alumni Directory', icon: UserSquare2 },
    { name: 'Messages', icon: MessageSquare, badge: 5 },
    { name: 'Saved', icon: Bookmark },
    { name: 'Notifications', icon: Bell },
    { name: 'Settings', icon: Settings },
  ];

  const handleItemClick = (name: string) => {
    if (onSelect) {
      onSelect(name);
    }
    // Close sidebar on mobile after clicking
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-800/80 bg-slate-950/95 p-6 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:bg-slate-950/40 lg:backdrop-blur-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/student/dashboard" className="flex items-center gap-3 group">
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

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem.toLowerCase() === item.name.toLowerCase();

            return (
              <button
                key={item.name}
                onClick={() => handleItemClick(item.name)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-lg shadow-blue-600/15 font-semibold' 
                    : 'hover:bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive 
                      ? 'bg-white text-blue-600' 
                      : 'bg-blue-600/20 text-blue-400 border border-blue-500/35'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={() => handleItemClick('Logout')}
            className="w-full flex items-center gap-3.5 px-4 py-3 mt-4 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 border border-transparent hover:border-rose-900/20 transition-all duration-300 group"
          >
            <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
            <span>Logout</span>
          </button>
        </nav>

        {/* Profile Details & Completeness */}
        <div className="mt-auto pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-3.5 mb-4 p-2 rounded-xl bg-slate-900/40 border border-slate-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-md shadow-blue-500/10">
              P
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white text-sm truncate">Piyush Mishra</span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">CSEIT • 2027</p>
            </div>
          </div>

          <div className="px-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
              <span>Profile Completeness</span>
              <span className="text-blue-400 font-semibold">80%</span>
            </div>
            <div className="h-2 w-full bg-slate-850 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] rounded-full transition-all duration-1000 ease-out" 
                style={{ width: '80%' }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
