import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Settings,
  Key,
  Database,
  Shield,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Server,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { user, role, department } = useAuth();
  const { addToast } = useToast();

  const [health, setHealth] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const data = await api.settings.getHealth();
      setHealth(data);
    } catch (err) {
      addToast('Failed to check system health', 'error');
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      addToast('Please enter an API key', 'warning');
      return;
    }

    setIsSavingKey(true);
    try {
      const res = await api.settings.updateApiKey(apiKeyInput.trim());
      addToast(res.message || 'Gemini API key updated successfully!', 'success');
      setApiKeyInput('');
      loadHealth();
    } catch (err) {
      addToast(err.message || 'Failed to update API key', 'error');
    } finally {
      setIsSavingKey(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12 max-w-5xl">
      {/* Header */}
      <div className="rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">System Administration</span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">Environment & Security</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Platform Configuration & Credentials
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
          Manage Google Gemini AI SDK connection, inspect database Row-Level Security, and audit role access permissions.
        </p>
      </div>

      {/* Gemini API Key Configuration Box */}
      <div className="rounded-2xl glass-panel-elevated p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Google Gemini Official SDK (@google/genai)</h2>
              <p className="text-xs text-slate-400">Configure your Google GenAI API key for live inference with gemini-2.5-flash and gemini-2.5-pro</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${health?.aiService?.hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-xs font-semibold text-slate-300">
              {health?.aiService?.hasApiKey ? 'Live Gemini Key Active' : 'Fallback Engine Mode'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveApiKey} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Enter Google Gemini API Key (or set in .env as GEMINI_API_KEY)
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={health?.aiService?.hasApiKey ? `Configured (${health.aiService.keyMasked})` : 'AIzaSy...'}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              CorpMind AI automatically falls back to an enterprise synthesis engine if the API key is not present or throttled.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingKey || !apiKeyInput.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-sm disabled:opacity-40 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingKey ? 'Testing & Verifying Key...' : 'Save & Verify Key'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database & RLS Status */}
      <div className="rounded-2xl glass-panel-elevated p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <Database className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Database & Row Level Security (RLS) Status</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 block">Database Storage Layer:</span>
            <span className="text-sm font-bold text-white font-mono">
              {health?.database?.driver || 'PostgreSQL / Local Adapter'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 block">Row Level Security Policies:</span>
            <span className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>RLS ACTIVE (document_isolation_policy)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Full-Stack Architecture Differentiation Inspector */}
      <div className="rounded-2xl glass-panel-elevated p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <Server className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="text-base font-bold text-white">Full-Stack Architecture & Subsystem Differentiation</h2>
            <p className="text-xs text-slate-400">Clear separation of concerns between client presentation, API gateway, and server engines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Frontend Subsystem (frontend/)</span>
              <span className="font-mono text-[11px] text-sky-300 px-2 py-0.5 rounded bg-sky-500/10">Port 5173</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li>• <strong>Framework:</strong> React 18 SPA + Vite bundler + Tailwind CSS</li>
              <li>• <strong>Security Sandbox:</strong> Runs strictly in user browser; zero backend secrets</li>
              <li>• <strong>Communication:</strong> Dispatches REST requests to <code className="text-sky-300 font-mono">/api/*</code> with JWT Bearer headers</li>
              <li>• <strong>Contracts:</strong> Uses isomorphic Zod schemas from <code className="text-sky-300 font-mono">frontend/src/validators/validators.js</code></li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Backend Subsystem (backend/)</span>
              <span className="font-mono text-[11px] text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/10">Port 5000</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li>• <strong>Framework:</strong> Node.js + Express.js API Gateway</li>
              <li>• <strong>Data Layer:</strong> PostgreSQL (pg Pool) with Row Level Security (RLS)</li>
              <li>• <strong>AI Layer:</strong> Official Google Gen AI SDK (<code className="text-emerald-300 font-mono">@google/genai</code>)</li>
              <li>• <strong>Security:</strong> Express Rate Limiter (300 req/15m), Bcrypt 12 rounds, JWT claims</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Matrix */}
      <div className="rounded-2xl glass-panel-elevated p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <Shield className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="text-base font-bold text-white">Role-Based Access Control (RBAC) Permissions</h2>
            <p className="text-xs text-slate-400">Granular rights enforced at both the API and database levels</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Role</th>
                <th className="p-3">Document Ingestion</th>
                <th className="p-3">Department Isolation</th>
                <th className="p-3">Workflow Creation</th>
                <th className="p-3">Audit Logs & API Keys</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium text-slate-300">
              <tr>
                <td className="p-3 font-bold text-white">Admin (Elena)</td>
                <td className="p-3 text-emerald-400 font-bold">Unrestricted</td>
                <td className="p-3 text-sky-400">Bypasses RLS (All Depts)</td>
                <td className="p-3 text-emerald-400">Full Access</td>
                <td className="p-3 text-emerald-400">Full Access</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">Manager (Ops / Fin / HR / Sup)</td>
                <td className="p-3 text-emerald-400">Authorized</td>
                <td className="p-3 text-amber-400">Strictly Own Department</td>
                <td className="p-3 text-emerald-400">Authorized</td>
                <td className="p-3 text-slate-500">Read-Only Audit</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">Standard Employee (Alex)</td>
                <td className="p-3 text-emerald-400">Authorized</td>
                <td className="p-3 text-amber-400">Strictly Own Department</td>
                <td className="p-3 text-slate-500">View & Trigger Only</td>
                <td className="p-3 text-slate-500">Restricted</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
