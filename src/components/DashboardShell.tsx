import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  GraduationCap, 
  Shield, 
  Building2, 
  UserCheck, 
  LogOut, 
  Bell, 
  Layers, 
  Home, 
  FileText, 
  History, 
  QrCode, 
  User as UserIcon, 
  HelpCircle,
  Users,
  CheckCircle,
  Clock,
  Settings,
  ChevronDown
} from 'lucide-react';

interface ShellProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<ShellProps> = ({ currentTab, onTabChange, children }) => {
  const { currentUser, currentRole, logout, notifications, users, switchUserById } = useApp();
  const [showRoleSwitcher, setShowRoleSwitcher] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadNotifs = notifications.filter(n => !n.read && (n.userId === currentUser?.id || currentRole === 'admin'));

  // Navigation items by role
  const getNavItems = () => {
    switch (currentRole) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'apply-outpass', label: 'Apply Outpass', icon: FileText },
          { id: 'my-applications', label: 'Track Outpass', icon: Clock },
          { id: 'outpass-history', label: 'Outpass History', icon: History },
          { id: 'gate-passes', label: 'Gate Passes (QR)', icon: QrCode },
          { id: 'hostel-profile', label: 'My Profile', icon: UserIcon },
          { id: 'support-and-help', label: 'Support & Help', icon: HelpCircle },
        ];
      case 'faculty':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'pending-approvals', label: 'Pending Approvals', icon: Clock, badge: '08' },
          { id: 'my-students', label: 'My Students', icon: Users },
          { id: 'approval-history', label: 'Approval History', icon: History },
          { id: 'faculty-profile', label: 'Faculty Profile', icon: UserIcon },
          { id: 'notifications-page', label: 'Notifications', icon: Bell },
        ];
      case 'hod':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'pending-hod-approvals', label: 'Pending Approvals', icon: Clock, badge: '24' },
          { id: 'department-outpasses', label: 'Dept Outpasses', icon: FileText },
          { id: 'department-students', label: 'Dept Students', icon: Users },
          { id: 'approval-history', label: 'Approval History', icon: History },
          { id: 'hod-profile', label: 'HOD Profile', icon: UserIcon },
          { id: 'notifications-page', label: 'Notifications', icon: Bell },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'pending-final-approvals', label: 'Pending Final Approvals', icon: CheckCircle, badge: '32' },
          { id: 'all-college-outpasses', label: 'All College Outpasses', icon: Layers },
          { id: 'department-overview', label: 'Department Overview', icon: Building2 },
          { id: 'user-management', label: 'User & Role Management', icon: Users },
          { id: 'approval-history', label: 'Audit & History', icon: History },
          { id: 'admin-profile', label: 'Associate Dean Profile', icon: UserIcon },
          { id: 'notifications-page', label: 'Notifications', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getPortalLabel = () => {
    switch (currentRole) {
      case 'student': return 'STUDENT PORTAL';
      case 'faculty': return 'FACULTY PORTAL';
      case 'hod': return 'HOD PORTAL';
      case 'admin': return 'ASSOCIATE DEAN PORTAL';
      default: return 'PORTAL';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-[#111C2D]">
      {/* FIXED SIDEBAR */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 flex-shrink-0 flex flex-col justify-between fixed h-full z-40 transition-all border-r border-slate-800">
        <div>
          {/* Header branding */}
          <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 shadow-md border border-amber-300 shrink-0">
              <img
                src="/assets/aistudio/dsu_983323a0.webp"
                alt="DSU Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-base leading-none tracking-tight truncate">Smart Outpass</span>
              <span className="text-[10px] font-semibold text-amber-300 tracking-wider uppercase mt-1 leading-none truncate">
                DSU • {getPortalLabel()}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4">
            <nav className="flex flex-col gap-1">
              {navItems.map(item => {
                const IconComponent = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom User / Block Badge & Logout */}
        <div>
          {currentRole === 'student' && currentUser && (
            <div className="mx-3 mb-3 p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hostel Block</span>
                <span className="text-xs font-semibold text-white truncate">{currentUser.hostelBlock || 'Kaveri Block 3'}</span>
                <span className="text-[11px] text-blue-400 font-mono">{currentUser.room || 'Room 412'}</span>
              </div>
              <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
            </div>
          )}

          {currentRole !== 'student' && currentUser && (
            <div className="mx-3 mb-3 p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Department</span>
                <span className="text-xs font-semibold text-white truncate">{currentUser.departmentName}</span>
                <span className="text-[11px] text-blue-400 font-mono">{currentUser.registerNumber || 'ID Verified'}</span>
              </div>
              <Shield className="w-5 h-5 text-slate-400 shrink-0" />
            </div>
          )}

          <div className="p-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={logout}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="pl-64 flex flex-col flex-1 min-h-screen">
        {/* TOP FIXED APP HEADER */}
        <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 px-6 sm:px-8 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          {/* Left Breadcrumb & Session Tag */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              {currentRole?.toUpperCase()} PORTAL
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Academic Session 2026–2027</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted Protocol</span>
            </div>
          </div>

          {/* Right User Actions & Fast Role Switcher */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            {/* Quick Role Switcher for verification & testing */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition"
                title="Switch active user or role for testing"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Switch Role:</span>
                <span className="text-blue-700 font-bold uppercase">{currentRole}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showRoleSwitcher && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                    Test User Accounts
                  </div>
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUserById(u.id);
                        setShowRoleSwitcher(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                        u.id === currentUser?.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0 uppercase">
                          {u.name ? u.name.slice(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{u.role} • {u.registerNumber || u.email.split('@')[0]}</p>
                        </div>
                      </div>
                      {u.id === currentUser?.id && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="font-bold text-slate-800">Notifications ({unreadNotifs.length} new)</span>
                    <button
                      onClick={() => onTabChange('notifications-page')}
                      className="text-blue-600 hover:underline text-[11px]"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.slice(0, 4).map(n => (
                      <div key={n.id} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800">{n.title}</span>
                        <p className="text-[11px] text-slate-600">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1">{n.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current User Badge */}
            {currentUser && (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono leading-tight">
                    {currentUser.registerNumber || currentUser.email}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-100 uppercase tracking-wider shrink-0">
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'U'}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* MAIN BODY VIEW */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="w-full bg-white border-t border-slate-200/80 py-3.5 px-6 sm:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-5 h-5 object-contain rounded-full shadow-xs shrink-0" />
            <span>© 2026–2027 Smart Outpass Residential Governance System • Dhanalakshmi Srinivasan University, Samayapuram, Trichy</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="hover:text-blue-600 cursor-pointer">Security Protocol</span>
            <span>•</span>
            <span className="hover:text-blue-600 cursor-pointer">Turnstile Mesh API</span>
            <span>•</span>
            <span className="hover:text-blue-600 cursor-pointer">Campus Emergency: Ext. 4400</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
