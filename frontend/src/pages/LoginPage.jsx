import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { loginSchema, registerSchema } from '@shared/validators';
import {
  Shield,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, register, loginAsDemo } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('admin@corpmind.ai');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState('operations');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const val = loginSchema.safeParse({ email, password });
        if (!val.success) {
          addToast(val.error.errors[0]?.message || 'Invalid login details', 'error');
          setIsSubmitting(false);
          return;
        }
        await login(email, password);
      } else {
        const val = registerSchema.safeParse({ email, password, fullName, role, department });
        if (!val.success) {
          addToast(val.error.errors[0]?.message || 'Invalid registration details', 'error');
          setIsSubmitting(false);
          return;
        }
        await register({ email, password, fullName, role, department });
      }
      navigate('/dashboard');
    } catch (err) {
      // toast already shown in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async (roleKey) => {
    setIsSubmitting(true);
    try {
      await loginAsDemo(roleKey);
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 shadow-glow-lg mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">CorpMind AI</h1>
        <p className="mt-2 text-sm text-slate-400">
          Enterprise AI Operations & Multi-Departmental Workflow Automation Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Instant 1-Click Role Switcher */}
        <div className="lg:col-span-5 rounded-2xl glass-panel-elevated p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Instant Persona Access (RLS Demo)</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select any enterprise persona to instantly experience role-based access control and strict Row-Level Security data isolation.
            </p>

            <div className="space-y-2">
              {DEMO_PROFILES.map((p) => (
                <button
                  key={p.roleKey}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDemoClick(p.roleKey)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/80 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                        {p.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-sky-300 font-mono">
                        {p.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">{p.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Powered by Google Gemini 2.5 Flash & Pro Models</span>
          </div>
        </div>

        {/* Right Column: Standard Credentials Form */}
        <div className="lg:col-span-7 rounded-2xl glass-panel-elevated p-6 sm:p-8 border border-slate-800">
          <div className="flex border-b border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
                mode === 'login'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Sign In with Credentials
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
                mode === 'register'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Register Corporate Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jordan Hayes"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 capitalize"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 capitalize"
                    >
                      <option value="operations">Operations</option>
                      <option value="finance">Finance</option>
                      <option value="hr">HR</option>
                      <option value="support">Support</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@corpmind.ai"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-glow-sm transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Authenticate Session' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Demo Password: <code className="text-sky-400 font-mono">password123</code></span>
            <span>RLS Enforced at DB Layer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
