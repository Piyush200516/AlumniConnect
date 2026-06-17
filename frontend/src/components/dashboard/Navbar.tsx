import { useState } from 'react';
import { Bell, Search, Menu, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../layout/AuthProvider';

interface NavbarProps {
  onMenuToggle: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export default function Navbar({ onMenuToggle, onLogout, onProfileClick, onSettingsClick }: NavbarProps) {
  const { profile, loading } = useAuthContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock Notifications for dropdown list
  const sampleNotifications = [
    { id: 1, text: "Google updated their interview dates", time: "2 hours ago" },
    { id: 2, text: "Rahul Sharma accepted your connection request", time: "5 hours ago" },
    { id: 3, text: "New Alumni Talk: Career in SWE scheduled", time: "1 day ago" },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-900 bg-slate-950/60 px-6 backdrop-blur-xl">
      {/* Search and Sidebar Toggle */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuToggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white lg:hidden hover:bg-slate-850 transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Elegant Search Input */}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search jobs, events, mentors..."
            className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/40 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500/80 focus:bg-slate-900/60 focus:ring-1 focus:ring-blue-500/30 transition-all duration-300"
          />
        </div>
      </div>

      {/* Action Buttons & Avatar */}
      <div className="flex items-center gap-4">
        {/* Notification Bell with Badge */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all duration-300"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg shadow-rose-500/30">
              3
            </span>
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 z-40 w-80 rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-xl backdrop-blur-xl shadow-black/80"
                >
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2">
                    <span className="font-semibold text-white text-sm">Notifications</span>
                    <button className="text-xs text-blue-400 hover:underline">Mark read</button>
                  </div>
                  <div className="space-y-2">
                    {sampleNotifications.map((notif) => (
                      <div key={notif.id} className="p-2 rounded-lg hover:bg-slate-900/50 border border-transparent hover:border-slate-850 transition-all cursor-pointer">
                        <p className="text-xs text-slate-200">{notif.text}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Card & Dropdown */}
        <div className="relative">
          {loading || !profile ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-900 bg-slate-900/10 p-1.5 pr-3 animate-pulse">
              <div className="h-8 w-8 rounded-lg bg-slate-800 shrink-0" />
              <div className="hidden md:block space-y-1">
                <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
                <div className="h-2 w-10 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/30 p-1.5 pr-3 text-left hover:bg-slate-850/60 hover:border-slate-700/80 transition-all duration-300"
            >
              {profile.profileImage ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-850 shrink-0">
                  <img src={profile.profileImage} alt={profile.fullName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/10 shrink-0">
                  {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-white">{profile.fullName}</p>
                <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Student</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-white' : ''}`} />
            </button>
          )}

          {/* User Dropdown */}
          <AnimatePresence>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-35" onClick={() => setDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 z-40 w-52 rounded-2xl border border-slate-800 bg-slate-950/95 p-2 shadow-xl backdrop-blur-xl shadow-black/80"
                >
                  <button 
                    onClick={() => { setDropdownOpen(false); onProfileClick?.(); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-slate-450 hover:text-white hover:bg-slate-900/60 rounded-xl text-sm transition-all duration-200"
                  >
                    <User className="h-4.5 w-4.5 text-slate-500" />
                    Profile
                  </button>
                  <button 
                    onClick={() => { setDropdownOpen(false); onSettingsClick?.(); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-slate-450 hover:text-white hover:bg-slate-900/60 rounded-xl text-sm transition-all duration-200"
                  >
                    <Settings className="h-4.5 w-4.5 text-slate-500" />
                    Settings
                  </button>
                  <div className="my-1 border-t border-slate-850" />
                  <button 
                    onClick={() => { setDropdownOpen(false); onLogout?.(); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-rose-450 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl text-sm transition-all duration-200"
                  >
                    <LogOut className="h-4.5 w-4.5 text-rose-500" />
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
