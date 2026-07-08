import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '⚡', end: true },
  { to: '/courses', label: 'Courses', icon: '📚' },
  { to: '/workbench', label: 'Workbench', icon: '💻' },
  { to: '/chat', label: 'AI Personas', icon: '🤖' },
];

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-nexus-bg">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -12, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-56 flex flex-col border-r border-slate-200 bg-white shrink-0 shadow-sm"
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0">N</div>
            <div>
              <div className="text-slate-900 font-bold text-sm leading-none">Nexus SEOS</div>
              <div className="text-slate-400 text-xs mt-0.5 font-medium">v1.0</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.fullName?.[0] ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-800 text-xs font-semibold truncate">{user?.fullName}</div>
              <div className="text-slate-500 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all mt-1 font-medium"
          >
            Sign out
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

