import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DepartmentBadge from './common/DepartmentBadge';
import {
  Bell,
  Sparkles,
  ShieldCheck,
  UserCheck,
  LogOut,
  ChevronDown,
  Layers,
  Settings,
  Cpu,
  Network,
  X,
  Server,
  Layout,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ onOpenUploadModal }) {
  const { user, role, department, logout, loginAsDemo, demoProfiles } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showArchModal, setShowArchModal] = useState(false);

  const notifications = [
    { id: 1, title: 'AI Extraction Completed', desc: 'GPU Compute Invoice processed (Risk: 72/100)', time: '2m ago', unread: true },
    { id: 2, title: 'Workflow Trigger Dispatched', desc: 'SLA Breach Guard initiated carrier failover', time: '14m ago', unread: true },
    { id: 3, title: 'RLS Policy Verified', desc: 'Cross-department data isolation active', time: '1h ago', unread: false },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between">
        {/* Left: Department & RLS status */}
        <div className="flex items-center gap-3">
          <DepartmentBadge department={department} size="md" />

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RLS Active</span>
          </div>

          {/* Explicit Frontend ⮂ Backend Separation Indicator */}
          <button
            onClick={() => setShowArchModal(true)}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-xs font-medium text-slate-300 transition-all group"
            title="Inspect Frontend vs Backend Architecture Separation"
          >
            <Network className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-45 transition-transform" />
            <span className="font-mono text-[11px] text-sky-400">FE :5173</span>
            <span className="text-slate-600">⇄</span>
            <span className="font-mono text-[11px] text-emerald-400">BE :5000</span>
          </button>
        </div>

        {/* Right: Quick actions, notifications, role switcher, user profile */}
        <div className="flex items-center gap-3">
          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ingest Document</span>
            </button>
          )}

          {/* Quick Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleSwitcher(!showRoleSwitcher);
                setShowProfileMenu(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-sky-500/50 text-xs text-slate-200 font-medium transition-all"
              title="Switch demo role to test RLS boundaries"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline text-slate-400">Persona:</span>
              <span className="font-semibold text-white capitalize">{role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel-elevated p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Role (Instant RLS Demo)
                </div>
                <div className="py-1 space-y-1">
                  {(demoProfiles || []).map((p) => {
                    const isCurrent = user?.email === p.email;
                    return (
                      <button
                        key={p.roleKey}
                        onClick={() => {
                          loginAsDemo(p.roleKey);
                          setShowRoleSwitcher(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col gap-0.5 ${
                          isCurrent
                            ? 'bg-sky-500/20 border border-sky-500/40 text-white'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{p.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">
                            {p.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{p.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
                setShowRoleSwitcher(false);
              }}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel-elevated p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Operational Alerts</span>
                  <span className="text-[11px] text-sky-400 font-medium">3 New</span>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto mt-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 px-1 flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                      </div>
                      <span className="text-slate-400 text-[11px] leading-snug">{n.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowRoleSwitcher(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                {user?.full_name || 'Enterprise User'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel-elevated p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-slate-800">
                  <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono uppercase">
                      Role: {role}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-sky-400 font-mono uppercase">
                      {department}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Platform Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Architecture Differentiation Modal */}
      {showArchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl glass-panel-elevated border border-slate-800 shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Full-Stack Architecture Differentiation</h3>
                  <p className="text-xs text-slate-400">Strict separation of presentation, security, and data layers</p>
                </div>
              </div>
              <button
                onClick={() => setShowArchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frontend Card */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-sky-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                      <Layout className="w-4 h-4" />
                      <span>FRONTEND (frontend/)</span>
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      Port 5173
                    </span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                    <li>• <strong>Tech:</strong> React 18, Vite, Tailwind CSS, Recharts</li>
                    <li>• <strong>Boundary:</strong> Browser sandbox; zero database secrets or API keys</li>
                    <li>• <strong>State:</strong> JWT token stored in memory/localStorage</li>
                    <li>• <strong>Role:</strong> Responsive command UI, drag-drop file upload, client Zod pre-flight</li>
                  </ul>
                </div>

                {/* Backend Card */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Server className="w-4 h-4" />
                      <span>BACKEND (backend/)</span>
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Port 5000
                    </span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                    <li>• <strong>Tech:</strong> Node.js, Express.js, PostgreSQL (pg driver)</li>
                    <li>• <strong>Boundary:</strong> Secure server holding DATABASE_URL & GEMINI_API_KEY</li>
                    <li>• <strong>Security:</strong> Express Rate Limiter, Bcrypt (12 rounds), JWT verification</li>
                    <li>• <strong>AI Engine:</strong> @google/genai (gemini-2.5-flash & gemini-2.5-pro)</li>
                  </ul>
                </div>
              </div>

              {/* Shared Contract */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <Layers className="w-4 h-4" />
                  <span>SHARED CONTRACT LAYER (shared/validators.js)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Isomorphic Zod validation schemas are shared across client and server. The client uses them for instant pre-flight validation, and the server strictly re-validates all incoming request payloads to eliminate injection and malformed inputs.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowArchModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
