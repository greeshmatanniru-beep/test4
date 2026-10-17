import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  Briefcase,
  FileText,
  GitBranch,
  MessageSquareText,
  BarChart3,
  Settings,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { user, role, department } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Smart Requests & Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Knowledge Assistant', path: '/chat', icon: MessageSquareText },
    { name: 'Document Portal', path: '/documents', icon: FileText },
    { name: 'Workflow Builder', path: '/workflows', icon: GitBranch },
    { name: 'Department Hub', path: '/workspace', icon: Briefcase },
    { name: 'Analytics & Audit', path: '/analytics', icon: BarChart3 },
    { name: 'Settings & API', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-glow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
        </div>
        <div>
          <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
            NexusAI <span className="text-sky-400 font-mono text-xs px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">ENTERPRISE</span>
          </span>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Autonomous Operations</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
          Command Center
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Department context badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-sky-400" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wider">RLS Security Realm</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-snug">
            <p className="truncate"><strong className="text-slate-300">Dept:</strong> {(department || 'operations').toUpperCase()}</p>
            <p className="truncate"><strong className="text-slate-300">Role:</strong> {(role || 'employee').toUpperCase()}</p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Row-Level Isolation Enforced</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
