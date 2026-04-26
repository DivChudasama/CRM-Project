import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  UserCog,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Sidebar — Main navigation sidebar with Role-Based Access Control.
 * Shows/hides menu items based on the logged-in user's role.
 * Displays a prominent role badge for video proof.
 */
const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // ============================================================
  // RBAC Menu Configuration
  // roles: undefined = visible to ALL roles
  // roles: ['Admin'] = Admin only, etc.
  // ============================================================
  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      // Visible to everyone
    },
    {
      name: 'Leads',
      icon: Users,
      path: '/leads',
      // Visible to everyone
    },
    {
      name: 'Sales Reports',
      icon: BarChart3,
      path: '/reports',
      roles: ['Admin', 'Manager'], // Agent CANNOT see this
    },
    {
      name: 'User Management',
      icon: UserCog,
      path: '/users',
      roles: ['Admin'], // Admin ONLY
    },
    {
      name: 'System Settings',
      icon: Settings,
      path: '/settings',
      roles: ['Admin'], // Admin ONLY (Manager cannot access)
    },
  ];

  // Filter menu items based on current user's role
  const filteredItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  // Role badge styling
  const roleBadgeConfig = {
    Admin: {
      label: 'Admin',
      bg: 'bg-rose-500/20',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
      dot: 'bg-rose-400',
    },
    Manager: {
      label: 'Manager',
      bg: 'bg-amber-500/20',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
    },
    Agent: {
      label: 'Agent',
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-300',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
  };

  const badge = roleBadgeConfig[user?.role] || roleBadgeConfig['Agent'];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0 min-h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <ShieldCheck size={22} className="text-primary-400 mr-2 shrink-0" />
        <span className="text-xl font-bold tracking-wider text-primary-400">CRM PRO</span>
      </div>

      {/* ============================================================
          USER PROFILE + ROLE BADGE — Critical for video proof
          ============================================================ */}
      <div className="px-5 py-5 border-b border-slate-800">
        {/* Avatar */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-600 flex items-center justify-center font-bold text-lg text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* ROLE BADGE */}
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${badge.bg} ${badge.border}`}>
          <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`}></span>
          <span className={`text-xs font-extrabold uppercase tracking-widest ${badge.text}`}>
            Role: {badge.label}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 space-y-1 px-3">
        <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Navigation
        </p>
        {filteredItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 shrink-0" />
              {item.name}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
